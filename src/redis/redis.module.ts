import { Global, Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';

import { RedisService } from './redis.service';

import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';

@Global()
@Module({
  imports: [
    NestRedisModule.forRoot({
      type: 'single',
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    }),
  ],
  providers: [RedisService, AsyncErrorHandlerService, ErrorHandlerService],
})
export class RedisModule {}
