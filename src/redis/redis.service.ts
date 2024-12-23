import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';

import Redis from 'ioredis';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Injectable()
export class RedisService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const redisSetFunction = ttl
      ? this.redis.set(key, value, 'EX', ttl)
      : this.redis.set(key, value);
    this.asyncErrorHandlerService.execute(() => redisSetFunction);
  }

  async get(key: string): Promise<string | null> {
    return this.asyncErrorHandlerService.execute(() => this.redis.get(key));
  }

  async del(key: string): Promise<number> {
    return this.asyncErrorHandlerService.execute(() => this.redis.del(key));
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.asyncErrorHandlerService.execute(() =>
      this.redis.exists(key),
    );

    return result === 1;
  }
}
