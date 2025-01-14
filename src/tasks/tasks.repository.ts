import { Injectable } from '@nestjs/common';
import { Task } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { TaskResponse } from './interface/task-response.interface';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { RedisService } from '../redis/redis.service';
import { REDIS_TTL_IN_MILISECONDS } from '../utils/redis-keys';

@Injectable()
export class TaskRepository {
  constructor(
    private readonly redisService: RedisService,
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

  async findUniqueOrThrow({ redisKey = '', query }): Promise<Task> {
    const redisTaskData = redisKey
      ? await this.redisService.get(redisKey)
      : null;

    if (redisKey) return JSON.parse(redisTaskData);

    const currentTask = this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.findUniqueOrThrow(query),
    );

    if (redisKey)
      await this.redisService.set(
        redisKey,
        JSON.stringify(currentTask),
        REDIS_TTL_IN_MILISECONDS,
      );

    return currentTask;
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

  async delete({ redisKey = '', query }): Promise<void> {
    if (redisKey) this.redisService.del(redisKey);

    await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.delete(query),
    );
  }

  async update({ redisKey = '', query, data }): Promise<Task> {
    if (redisKey) this.redisService.del(redisKey);

    const currentTask = this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.update({
        ...query,
        data,
      }),
    );

    if (redisKey)
      await this.redisService.set(
        redisKey,
        JSON.stringify(currentTask),
        REDIS_TTL_IN_MILISECONDS,
      );

    return currentTask;
  }
}
