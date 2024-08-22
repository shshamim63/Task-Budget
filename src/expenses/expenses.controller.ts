import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { ExpenseResponseDto } from './dto/expense.dto';
import { CreateExpenseDto } from './dto/expense-create.dto';
import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';
import { Task } from '../tasks/decorators/task.decorator';
import { TaskResponseDto } from '../tasks/dto/task.dto';

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
}
