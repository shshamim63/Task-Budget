import { Module } from '@nestjs/common';

import { CollaboratorController } from './collaborators.controller';
import { CollaboratorService } from './collaborators.service';
import { TaskPermissionService } from '../helpers/task-permission.helper.service';
import { CollaboratorRepository } from './collaborator.repository';
import { TaskRepository } from '../tasks/tasks.repository';
import { UserRepository } from '../users/user.repository';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

import { RedisService } from '../redis/redis.service';
import { TaskCacheService } from '../tasks/tasks.cache.service';

@Module({
  controllers: [CollaboratorController],
  providers: [
    CollaboratorService,
    TaskPermissionService,
    CollaboratorRepository,
    TaskRepository,
    TaskCacheService,
    UserRepository,
    ErrorHandlerService,
    AsyncErrorHandlerService,
    RedisService,
  ],
})
export class CollaboratorModule {}
