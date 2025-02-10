import { Module } from '@nestjs/common';

import { ExpenseService } from './expenses.service';
import { ExpenseController } from './expenses.controller';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TaskRepository } from '../tasks/tasks.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { CollaboratorRepository } from '../collaborators/collaborator.repository';
import { ExpenseRepository } from './expense.repository';

import { ExpenseAuthorizationService } from './expense-authorization.service';
import { RedisService } from '../redis/redis.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ExpenseController],
  providers: [
    ExpenseService,
    ExpenseRepository,
    TaskRepository,
    CollaboratorRepository,
    ErrorHandlerService,
    AsyncErrorHandlerService,
    ExpenseAuthorizationService,
    RedisService,
  ],
})
export class ExpenseModule {}
