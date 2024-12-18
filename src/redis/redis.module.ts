import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    NestRedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    }),
  ],
  providers: [RedisService],
  exports: [NestRedisModule],
})
export class RedisModule {}
