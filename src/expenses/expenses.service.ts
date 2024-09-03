import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { UserType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { JWTPayload } from '../auth/interfaces/auth.interface';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseResponseDto } from './dto/expense.dto';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createExpense(
    user: JWTPayload,
    task: TaskResponseDto,
    createExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const isSuperUser = user.userType === UserType.SUPER;

    const hasPermission =
      isSuperUser || (await this.isACollaborator(user.id, task.id));

    if (!hasPermission)
      throw new UnauthorizedException('User cannot initiate expense');

    const data = {
      ...createExpenseDto,
      taskId: task.id,
      contributorId: user.id,
    };

    const expense = await this.prismaService.expense.create({ data });

    return new ExpenseResponseDto(expense);
  }

  async getExpense(
    user: JWTPayload,
    task: TaskResponseDto,
    expenseId: number,
  ): Promise<ExpenseResponseDto> {
    const hasPermission =
      user.userType === UserType.SUPER ||
      task.creatorId === user.id ||
      this.isACollaborator(user.id, task.id);

    if (!hasPermission)
      throw new UnauthorizedException(
        'User does not have permission to access the info',
      );

    const expense = await this.prismaService.expense.findUnique({
      where: { id: expenseId },
    });

    return new ExpenseResponseDto(expense);
  }

  async getExpenses(
    user: JWTPayload,
    task: TaskResponseDto,
  ): Promise<ExpenseResponseDto[]> {
    const isSuperUser = user.userType === UserType.SUPER;
    const isTaskCreator = task.creatorId === user.id;

    const hasPermission =
      isSuperUser || isTaskCreator || this.isACollaborator(user.id, task.id);

    if (!hasPermission)
      throw new UnauthorizedException(
        'User does not have permission to access the info',
      );

    const expenses = await this.prismaService.expense.findMany({
      where: { taskId: task.id },
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

    const isSuperUser = user.userType === UserType.SUPER;
    const isTaskCreator = task.creatorId === user.id;
    const isContributor = currentExpense.contributorId === user.id;

    if (updateExpenseDto.contributorId && (!isSuperUser || !isTaskCreator))
      throw new UnauthorizedException('User cannot update expense');

    const hasPermission = isSuperUser || isTaskCreator || isContributor;

    if (!hasPermission)
      throw new UnauthorizedException('User cannot update expense');

    const updatedExpense = await this.prismaService.expense.update({
      where: {
        id: expenseId,
      },
      data: updateExpenseDto,
    });

    return new ExpenseResponseDto(updatedExpense);
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
