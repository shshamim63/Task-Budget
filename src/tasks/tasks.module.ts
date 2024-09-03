import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
