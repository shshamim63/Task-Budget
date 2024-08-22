import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { JWTPayload } from '../interface/auth.interface';

import { CreateExpenseDto } from './dto/expense-create.dto';
import { ExpenseResponseDto } from './dto/expense.dto';
import { TaskResponseDto } from '../tasks/dto/task.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createExpense(
    user: JWTPayload,
    task: TaskResponseDto,
    createExpenseDto: CreateExpenseDto,
  ) {
    const data = {
      ...createExpenseDto,
      taskId: task.id,
      contributorId: user.id,
    };
    try {
      const expense = await this.prismaService.expense.create({ data });
      return new ExpenseResponseDto(expense);
    } catch (error) {
      console.log(error);
    }
  }
}
