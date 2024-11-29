import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { TaskResponse } from './interface/task-response.interface';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Injectable()
export class TaskRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async findFirst(query): Promise<Task> {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.findFirst(query),
    );
  }

  async findUnique(query): Promise<TaskResponse> {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.findUnique(query),
    );
  }

  async findUniqueOrThrow(query): Promise<Task> {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.findUniqueOrThrow(query),
    );
  }

  async findMany(query): Promise<TaskResponse[]> {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.findMany(query),
    );
  }

  async create(data): Promise<Task> {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.create({ data }),
    );
  }

  async delete(query): Promise<void> {
    await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.delete(query),
    );
  }

  async update(query, data): Promise<Task> {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.update({
        ...query,
        data,
      }),
    );
  }
}
