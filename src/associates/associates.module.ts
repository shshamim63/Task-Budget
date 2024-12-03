import { Module } from '@nestjs/common';
import { AssociateController } from './associates.controller';
import { UserRepository } from '../auth/user.repository';
import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TokenService } from '../token/token.service';
import { AssociateService } from './associates.service';
import { AssociateRepository } from './associate.repository';

@Module({
  controllers: [AssociateController],
  providers: [
    AssociateService,
    AssociateRepository,
    PrismaService,
    UserRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
    TokenService,
  ],
})
export class AssociateModule {}
