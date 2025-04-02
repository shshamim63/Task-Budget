import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { TaskResponse } from './interface/task-response.interface';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Injectable()
export class TaskRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async findFirst(query: Prisma.TaskFindFirstArgs): Promise<Task> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.findFirst(query),
    );
  }

  async findUnique(query: Prisma.TaskFindUniqueArgs): Promise<TaskResponse> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.findUnique(query),
    );
  }

  async findUniqueOrThrow(
    query: Prisma.TaskFindUniqueOrThrowArgs,
  ): Promise<Task> {
    const currentTask = this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.findUniqueOrThrow(query),
    );
    return currentTask;
  }

  async findMany(query: Prisma.TaskFindManyArgs): Promise<TaskResponse[]> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.findMany(query),
    );
  }

  async create(payload: Prisma.TaskCreateArgs): Promise<Task> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.create(payload),
    );
  }

  async delete(query): Promise<void> {
    await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.delete(query),
    );
  }

  async update(payload: Prisma.TaskUpdateArgs): Promise<Task> {
    const currentTask = await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.update(payload),
    );
    return currentTask;
  }
}
