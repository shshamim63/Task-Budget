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

import { ExpensesService } from './expenses.service';

import { AuthGuard } from '../auth/guards/auth.guard';

import { User } from '../decorators/user.decorator';
import { Task } from '../tasks/decorators/task.decorator';

import { ExpenseResponseDto } from './dto/expense.dto';
import { CreateExpenseDto } from './dto/expense-create.dto';
import { TaskResponseDto } from '../tasks/dto/task.dto';

import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';
import { JWTPayload } from '../interface/auth.interface';

@Controller('tasks/:taskId/expenses')
@UseGuards(AuthGuard)
@UseInterceptors(TaskInterceptor)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  createExpense(
    @Body() createExpenseDto: CreateExpenseDto,
    @User() user,
    @Task() task: TaskResponseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.createExpense(user, task, createExpenseDto);
  }

  @Get()
  getExpenses(
    @User() user: JWTPayload,
    @Task() task: TaskResponseDto,
  ): Promise<ExpenseResponseDto[]> {
    return this.expensesService.getExpenses(user, task);
  }

  @Patch('/:expenseId')
  updateExpense(
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() updateExpenseDto: CreateExpenseDto,
    @User() user,
    @Task() task: TaskResponseDto,
  ): Promise<ExpenseResponseDto> {
    return this.expensesService.updateExpense(
      user,
      task,
      updateExpenseDto,
      expenseId,
    );
  }
}
