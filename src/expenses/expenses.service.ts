import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Expense, UserType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { JWTPayload } from '../auth/interfaces/auth.interface';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseResponseDto } from './dto/expense.dto';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ExpensesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createExpense(
    user: JWTPayload,
    task: TaskResponseDto,
    createExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const { id: userId } = user;
    const { id: taskId, budget: taskBudget } = task;

    const isAuthorized = await this.hasPermission({ user, task });

    if (!isAuthorized)
      throw new ForbiddenException('User cannot initiate expense');

    const isExceedingBudget = await this.isExceddingTaskBudget(
      taskId,
      createExpenseDto,
      taskBudget,
    );

    if (isExceedingBudget)
      throw new BadRequestException('Expenses exceeds task budget');

    const data = {
      ...createExpenseDto,
      taskId: taskId,
      contributorId: userId,
    };

    const expense = await this.prismaService.expense.create({
      data,
      select: {
        id: true,
        description: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
        contributor: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    return new ExpenseResponseDto(expense);
  }

  async getExpense(
    user: JWTPayload,
    task: TaskResponseDto,
    expenseId: number,
  ): Promise<ExpenseResponseDto> {
    const isAuthorized = await this.hasPermission({ user, task });

    if (!isAuthorized)
      throw new ForbiddenException(
        'User does not have permission to access the info',
      );

    const expense = await this.prismaService.expense.findUnique({
      where: { id: expenseId },
      select: {
        id: true,
        description: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
        contributor: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    return new ExpenseResponseDto(expense);
  }

  async getExpenses(
    user: JWTPayload,
    task: TaskResponseDto,
  ): Promise<ExpenseResponseDto[]> {
    const isAuthorized = await this.hasPermission({ user, task });

    if (!isAuthorized)
      throw new ForbiddenException(
        'User does not have permission to access the info',
      );

    const expenses = await this.prismaService.expense.findMany({
      where: { taskId: task.id },
      select: {
        id: true,
        description: true,
        amount: true,
        createdAt: true,
        updatedAt: true,
        contributor: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    return expenses.map((expense) => new ExpenseResponseDto(expense));
  }

  async updateExpense(
    user: JWTPayload,
    task: TaskResponseDto,
    updateExpenseDto: UpdateExpenseDto,
    expenseId: number,
  ): Promise<ExpenseResponseDto> {
    const currentExpense = await this.prismaService.expense.findFirst({
      where: { id: expenseId },
    });

    if (!currentExpense)
      throw new NotFoundException(
        `Expense with id: ${expenseId} does not exist`,
      );

    const isAuthorized = this.canUpdateExpense({
      user,
      task,
      currentExpense,
      updateExpenseDto,
    });

    if (!isAuthorized)
      throw new ForbiddenException('User cannot update the expense');

    const updatedExpense = await this.prismaService.expense.update({
      where: {
        id: expenseId,
      },
      data: updateExpenseDto,
    });

    return new ExpenseResponseDto(updatedExpense);
  }

  private async hasPermission({
    user: { userType, id: userId },
    task: { id: taskId, creatorId: taskCreatorId },
  }: {
    user: JWTPayload;
    task: TaskResponseDto;
  }): Promise<boolean> {
    const isSuperUser = userType === UserType.SUPER;
    const isTaskCreator = userId === taskCreatorId;

    const hasPermission =
      isSuperUser ||
      isTaskCreator ||
      (await this.isACollaborator(userId, taskId));

    return hasPermission;
  }

  private async isExceddingTaskBudget(
    taskId: number,
    createExpenseDto,
    taskBudget,
  ): Promise<boolean> {
    const {
      _sum: { amount: totalExpense },
    } = await this.prismaService.expense.aggregate({
      where: { taskId: taskId },
      _sum: { amount: true },
    });

    const { amount: currentExpenseAmount } = createExpenseDto;

    const isExceedingBudget = new Decimal(currentExpenseAmount)
      .plus(totalExpense)
      .greaterThan(new Decimal(taskBudget));

    return isExceedingBudget;
  }

  private canUpdateExpense({
    user,
    task,
    currentExpense,
    updateExpenseDto,
  }: {
    user: JWTPayload;
    task: TaskResponseDto;
    currentExpense: Expense;
    updateExpenseDto: UpdateExpenseDto;
  }): boolean {
    const isSuperUser = user.userType === UserType.SUPER;
    const isTaskCreator = task.creatorId === user.id;
    const isContributor = currentExpense.contributorId === user.id;

    if (updateExpenseDto.contributorId && (!isSuperUser || !isTaskCreator))
      return false;

    const hasPermission = isSuperUser || isTaskCreator || isContributor;

    if (!hasPermission) return false;

    return true;
  }

  private async isACollaborator(
    userId: number,
    taskId: number,
  ): Promise<boolean> {
    const collaboration = await this.prismaService.userTasks.findUnique({
      where: {
        memberId_taskId: {
          memberId: userId,
          taskId: taskId,
        },
      },
    });

    return !!collaboration;
  }
}
