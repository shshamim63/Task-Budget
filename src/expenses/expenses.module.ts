import { Module } from '@nestjs/common';

import { TokenModule } from '../token/token.module';
import { PrismaModule } from '../prisma/prisma.module';

import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TaskRepository } from '../tasks/repositories/task.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { CollaboratorRepository } from '../collaborators/repositories/collaborator.repository';
import { ExpenseRepository } from './repositories/expense.repository';
import { UserRepository } from '../auth/repositories/user.repository';

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
  ],
})
export class ExpensesModule {}
