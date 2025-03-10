import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { UsersModule } from '../users/users.module';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AsyncErrorHandlerService,
    ErrorHandlerService,
    RedisService,
  ],
})
export class AuthModule {}
