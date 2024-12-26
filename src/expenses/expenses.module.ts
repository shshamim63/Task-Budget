import { Module } from '@nestjs/common';

import { ExpenseService } from './expenses.service';
import { ExpenseController } from './expenses.controller';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TaskRepository } from '../tasks/tasks.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { CollaboratorRepository } from '../collaborators/collaborator.repository';
import { ExpenseRepository } from './expense.repository';
import { UserRepository } from '../auth/user.repository';
import { ExpenseAuthorizationService } from './expense-authorization.service';
import { RedisService } from '../redis/redis.service';

@Module({
  controllers: [ExpenseController],
  providers: [
    ExpenseService,
    ExpenseRepository,
    UserRepository,
    TaskRepository,
    CollaboratorRepository,
    ErrorHandlerService,
    AsyncErrorHandlerService,
    ExpenseAuthorizationService,
    RedisService,
  ],
})
export class ExpenseModule {}
