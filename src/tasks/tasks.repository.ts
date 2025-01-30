import { Injectable } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';

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

  async findUniqueOrThrow({
    redisKey = '',
    query,
  }: {
    redisKey?: string;
    query: Prisma.TaskFindUniqueOrThrowArgs;
  }): Promise<Task> {
    const redisTaskData = redisKey
      ? await this.redisService.get(redisKey)
      : null;

    if (redisTaskData && Object.keys(JSON.parse(redisTaskData)).length)
      return JSON.parse(redisTaskData);

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

  async delete({ redisKey = '', query }): Promise<void> {
    if (redisKey) this.redisService.del(redisKey);

    await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.delete(query),
    );
  }

  async update({ redisKey = '', payload }): Promise<Task> {
    if (redisKey) this.redisService.del(redisKey);

    const currentTask = await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.task.update(payload),
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
