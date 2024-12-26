import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { UserRepository } from './user.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
  ],
  exports: [UserRepository],
})
export class AuthModule {}
