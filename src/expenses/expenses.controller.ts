import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ExpenseService } from './expenses.service';

import { AuthGuard } from '../auth/guards/auth.guard';

import { User } from '../decorators/user.decorator';
import { Task } from '../tasks/decorators/task.decorator';

import { ExpenseResponseDto } from './dto/expense.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { TaskResponseDto } from '../tasks/dto/task.dto';

import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('tasks/:taskId/expenses')
@UseInterceptors(CacheInterceptor)
@UseGuards(AuthGuard)
@UseInterceptors(TaskInterceptor)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async createExpense(
    @Body() createExpenseDto: CreateExpenseDto,
    @User() user,
    @Task() task: TaskResponseDto,
  ): Promise<ExpenseResponseDto> {
    const newExpense = await this.expenseService.createExpense(
      user,
      task,
      createExpenseDto,
    );
    return new ExpenseResponseDto(newExpense);
  }

  @Get('/:expenseId')
  async getExpense(
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @User() user: JWTPayload,
    @Task() task: TaskResponseDto,
  ): Promise<ExpenseResponseDto> {
    const expense = await this.expenseService.getExpense(user, task, expenseId);
    return new ExpenseResponseDto(expense);
  }

  @Get()
  async getExpenses(
    @User() user: JWTPayload,
    @Task() task: TaskResponseDto,
  ): Promise<ExpenseResponseDto[]> {
    const expenses = await this.expenseService.getExpenses(user, task);
    return expenses.map((expense) => new ExpenseResponseDto(expense));
  }

  @Patch('/:expenseId')
  async updateExpense(
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @User() user,
    @Task() task: TaskResponseDto,
  ): Promise<ExpenseResponseDto> {
    const updatedExpense = await this.expenseService.updateExpense(
      user,
      task,
      updateExpenseDto,
      expenseId,
    );
    return new ExpenseResponseDto(updatedExpense);
  }
}
