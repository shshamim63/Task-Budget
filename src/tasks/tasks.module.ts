import { Module } from '@nestjs/common';
import { TaskController } from './tasks.controller';
import { TaskService } from './tasks.service';

import { TaskPermissionService } from '../helpers/task-permission.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TaskRepository } from './tasks.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { UserRepository } from '../users/user.repository';
import { RedisService } from '../redis/redis.service';
import { AssociateModule } from '../associates/associates.module';

@Module({
  imports: [AssociateModule],
  controllers: [TaskController],
  providers: [
    TaskService,
    TaskPermissionService,
    TaskRepository,
    UserRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
    RedisService,
  ],
})
export class TaskModule {}
