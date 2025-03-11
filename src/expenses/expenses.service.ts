import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { JWTPayload } from '../auth/interfaces/auth.interface';

import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseResponseDto } from './dto/expense.dto';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { ExpenseRepository } from './expense.repository';
import { RESPONSE_MESSAGE } from '../utils/constants';
import { ExpenseAuthorizationService } from './expense-authorization.service';
import { Prisma } from '@prisma/client';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ExpenseService {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly expenseAuthorizationService: ExpenseAuthorizationService,
  ) {}

  async createExpense(
    user: JWTPayload,
    task: TaskResponseDto,
    createExpenseDto: CreateExpenseDto,
  ): Promise<ExpenseResponseDto> {
    const { id: userId } = user;
    const { id: taskId, budget } = task;
    const { amount: newExpenseAmount } = createExpenseDto;

    const isAuthorized =
      await this.expenseAuthorizationService.canCreateExpense(user, task);

    if (!isAuthorized)
      throw new ForbiddenException(RESPONSE_MESSAGE.EXPENSE_PERMISSION_DENIED);

    const expensesInTotal = await this.totalExpense(taskId);

    const isExceedingBudget =
      this.expenseAuthorizationService.isExpenseExceedingBudget(
        budget,
        expensesInTotal,
        newExpenseAmount,
      );

    if (isExceedingBudget)
      throw new BadRequestException(RESPONSE_MESSAGE.EXPENSE_EXCEED);

    const data = {
      ...createExpenseDto,
      taskId: taskId,
      contributorId: userId,
    };
    const createArgument = {
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
    };
    const expense = await this.expenseRepository.create(createArgument);

    return plainToInstance(ExpenseResponseDto, expense);
  }

  async getExpense(
    user: JWTPayload,
    task: TaskResponseDto,
    expenseId: number,
  ): Promise<ExpenseResponseDto> {
    const isAuthorized = await this.expenseAuthorizationService.canViewExpense(
      user,
      task,
    );

    if (!isAuthorized)
      throw new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED);

    const query = {
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
    };
    const expense = await this.expenseRepository.findUnique(query);

    return plainToInstance(ExpenseResponseDto, expense);
  }

  async getExpenses(
    user: JWTPayload,
    task: TaskResponseDto,
  ): Promise<ExpenseResponseDto[]> {
    const isAuthorized = await this.expenseAuthorizationService.canViewExpense(
      user,
      task,
    );

    if (!isAuthorized)
      throw new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED);

    const query = {
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
    };

    const expenses = await this.expenseRepository.findMany(query);

    return expenses.map((expense) => new ExpenseResponseDto(expense));
  }

  async updateExpense(
    user: JWTPayload,
    task: TaskResponseDto,
    updateExpenseDto: UpdateExpenseDto,
    expenseId: number,
  ): Promise<ExpenseResponseDto> {
    const { id: taskId, budget } = task;
    const query = {
      where: { id: expenseId },
    };
    const currentExpense = await this.expenseRepository.findFirst(query);

    if (!currentExpense)
      throw new NotFoundException(
        `${RESPONSE_MESSAGE.NOTFOUND_RECORD} ${expenseId}`,
      );

    const isAuthorized = this.expenseAuthorizationService.canUpdateExpence(
      user,
      task,
      currentExpense,
      updateExpenseDto,
    );

    if (!isAuthorized)
      throw new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED);

    if (updateExpenseDto.amount) {
      const expensesInTotal = await this.totalExpense(taskId);

      const currentExcludedTotalExpense = new Decimal(expensesInTotal).minus(
        currentExpense.amount,
      );
      const isExceedingBudget =
        this.expenseAuthorizationService.isExpenseExceedingBudget(
          budget,
          currentExcludedTotalExpense,
          updateExpenseDto.amount,
        );

      if (isExceedingBudget)
        throw new BadRequestException(RESPONSE_MESSAGE.EXPENSE_EXCEED);
    }

    const payload = { ...query, data: updateExpenseDto };
    const updatedExpense = await this.expenseRepository.update(payload);

    return plainToInstance(ExpenseResponseDto, updatedExpense);
  }

  private async totalExpense(taskId: number) {
    const query = { where: { taskId } };
    const aggregateArg = {
      _sum: { amount: true },
    };
    const payload = {
      ...query,
      ...aggregateArg,
    } as Prisma.ExpenseAggregateArgs;
    const {
      _sum: { amount: totalExpense },
    } = await this.expenseRepository.aggregate(payload);

    return totalExpense;
  }
}
