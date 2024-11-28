import { Module } from '@nestjs/common';
import { EnterpriseController } from './enterprises.controller';
import { EnterpriseService } from './exterprises.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { EnterpriseRepository } from './enterprise.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { UserRepository } from '../auth/user.repository';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [EnterpriseController],
  providers: [
    EnterpriseService,
    EnterpriseRepository,
    ErrorHandlerService,
    AsyncErrorHandlerService,
    UserRepository,
  ],
})
export class EnterpriseModule {}
