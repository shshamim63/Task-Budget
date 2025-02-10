import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RedisService } from '../redis/redis.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { UserRepository } from './user.repository';

@Module({
  providers: [
    UsersService,
    UserRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
    RedisService,
  ],
  controllers: [UsersController],
  exports: [UserRepository],
})
export class UsersModule {}
