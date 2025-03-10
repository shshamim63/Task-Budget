import { Global, Module } from '@nestjs/common';

import { TokenService } from './token.service';
import { TokenRepository } from './token.repository';
import { RedisService } from '../redis/redis.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';

@Global()
@Module({
  providers: [
    RedisService,
    TokenService,
    TokenRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
  ],
  exports: [TokenService],
})
export class TokenModule {}
