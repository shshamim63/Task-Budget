import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { Task } from '@prisma/client';
import {
  REDIS_KEYS_FOR_TASK,
  REDIS_TTL_IN_MILISECONDS,
} from '../utils/redis-keys';

@Injectable()
export class TaskCacheService {
  constructor(private readonly redisService: RedisService) {}

  async getTaskFromCache(id: number): Promise<any> {
    if (!id) throw new InternalServerErrorException('task id is required');
    const redisKey = this.generateRedisKey(id);
    const data = await this.redisService.get(redisKey);

    return data ? JSON.parse(data) : null;
  }

  async setTaskInCache(taskData: Task): Promise<void> {
    if (!taskData || !Object.keys(taskData).length)
      throw new InternalServerErrorException('task data required');

    const redisKey = this.generateRedisKey(taskData.id);

    await this.redisService.set(
      redisKey,
      JSON.stringify(taskData),
      REDIS_TTL_IN_MILISECONDS,
    );
  }

  async deleteTaskFromCache(id: number): Promise<void> {
    if (!id) throw new InternalServerErrorException('task id is required');

    const redisKey = this.generateRedisKey(id);

    await this.redisService.del(redisKey);
  }

  private generateRedisKey(id: number): string {
    return `${REDIS_KEYS_FOR_TASK.TASK_WITH_ID}-${id}`;
  }
}
