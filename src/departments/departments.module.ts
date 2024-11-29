import { Module } from '@nestjs/common';
import { DepartmentController } from './departments.controller';
import { DepartmentService } from './departments.service';
import { PrismaModule } from '../prisma/prisma.module';
import { DepartmentRepository } from './departments.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TokenModule } from '../token/token.module';
import { UserRepository } from '../auth/user.repository';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [DepartmentController],
  providers: [
    DepartmentService,
    DepartmentRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
    UserRepository,
  ],
})
export class DepartmentModule {}
