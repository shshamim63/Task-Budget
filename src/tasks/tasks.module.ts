import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { TaskPermissionService } from '../helpers/task-permission.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TaskRepository } from './repositories/task.repository';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    TaskPermissionService,
    TaskRepository,
    ErrorHandlerService,
  ],
})
export class TasksModule {}
