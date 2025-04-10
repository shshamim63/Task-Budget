import { Injectable } from '@nestjs/common';
import { Associate } from '@prisma/client';

import { RedisService } from '../redis/redis.service';

import {
  REDIS_KEYS_FOR_ASSOCIATE,
  REDIS_TTL_IN_MILISECONDS,
} from '../utils/redis-keys';

@Injectable()
export class AssociateCacheService {
  constructor(private readonly redisService: RedisService) {}

  async getAssociatesToFromCache(id: number): Promise<Associate[]> {
    const redisAssociatesToKey = this.getAssociatesToRedisKey(id);
    const data = await this.redisService.get(redisAssociatesToKey);

    if (data) return JSON.parse(data);

    return null;
  }

  async setAssociatesToFromCache(id: number, payload: Associate[]) {
    const redisAssociatesToKey = this.getAssociatesToRedisKey(id);

    await this.redisService.set(
      redisAssociatesToKey,
      JSON.stringify(payload),
      REDIS_TTL_IN_MILISECONDS,
    );
  }

  private getAssociatesToRedisKey(id: number): string {
    const { PREFIX, SUFFIX } = REDIS_KEYS_FOR_ASSOCIATE.AFFILIATE_TO;
    const redisKey = `${PREFIX}-${id}-${SUFFIX}`;
    return redisKey;
  }
}
