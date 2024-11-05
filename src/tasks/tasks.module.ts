import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { TaskPermissionService } from '../helpers/task-permission.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TaskRepository } from './repositories/task.repository';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { UserRepository } from '../auth/repositories/user.repository';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    TaskPermissionService,
    TaskRepository,
    UserRepository,
    AsyncErrorHandlerService,
    ErrorHandlerService,
  ],
})
export class TasksModule {}
