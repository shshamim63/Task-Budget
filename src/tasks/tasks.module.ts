import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';
import { TaskPermissionService } from '../helpers/task-permission-helper.service';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [TasksController],
  providers: [TasksService, TaskPermissionService],
})
export class TasksModule {}
