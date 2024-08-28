import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { JWTPayload } from '../interface/auth.interface';

import { CreateExpenseDto } from './dto/expense-create.dto';
import { ExpenseResponseDto } from './dto/expense.dto';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { UserType } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private readonly prismaService: PrismaService) {}

  async createExpense(
    user: JWTPayload,
    task: TaskResponseDto,
    createExpenseDto: CreateExpenseDto,
  ) {
    try {
      const hasPermission =
        user.userType === UserType.SUPER ||
        (await this.isACollaborator(user.id, task.id));

      if (!hasPermission)
        throw new UnauthorizedException('User cannot initiate expense');

      const data = {
        ...createExpenseDto,
        taskId: task.id,
        contributorId: user.id,
      };

      const expense = await this.prismaService.expense.create({ data });

      return new ExpenseResponseDto(expense);
    } catch (error) {
      throw error;
    }
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

    return collaboration ? true : false;
  }
}
