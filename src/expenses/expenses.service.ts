import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JWTPayload } from '../interface/auth.interface';
import { Task } from '@prisma/client';
import { CreateExpenseDto } from './dto/expense-create.dto';
import { ExpenseResponseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createExpense(
    user: JWTPayload,
    task: Task,
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
