import { Module } from '@nestjs/common';

import { TokenModule } from '../token/token.module';
import { PrismaModule } from '../prisma/prisma.module';

import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TaskRepository } from '../tasks/task.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { CollaboratorRepository } from '../collaborators/collaborator.repository';
import { ExpenseRepository } from './expense.repository';
import { UserRepository } from '../auth/user.repository';
import { ExpenseAuthorizationService } from './expense-authorization.service';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [ExpensesController],
  providers: [
    ExpensesService,
    ExpenseRepository,
    UserRepository,
    TaskRepository,
    CollaboratorRepository,
    ErrorHandlerService,
    AsyncErrorHandlerService,
    ExpenseAuthorizationService,
  ],
})
export class ExpensesModule {}
