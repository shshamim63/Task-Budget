import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { UserRepository } from './repositories/user.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
  ],
})
export class AuthModule {}
