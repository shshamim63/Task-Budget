import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { TOKENS } from '../utils/constants';
import { TokenType } from '../auth/interfaces/auth.interface';

@Injectable()
export class TokenCacheService {
  constructor(private readonly redisService: RedisService) {}

  async setRefreshToken(userId: number, token: string): Promise<void> {
    const key = this.getKey(userId);
    const { ttl } = TOKENS[TokenType.RefreshToken];
    await this.redisService.set(key, token, ttl);
  }

  async getRefreshToken(userId: number): Promise<string> {
    const key = this.getKey(userId);
    return this.redisService.get(key);
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    const key = this.getKey(userId);
    await this.redisService.del(key);
  }

  private getKey(userId: number): string {
    return `token-user-${userId}`;
  }
}
