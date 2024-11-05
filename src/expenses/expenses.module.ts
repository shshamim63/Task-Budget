import { Module } from '@nestjs/common';

import { TokenModule } from '../token/token.module';
import { PrismaModule } from '../prisma/prisma.module';

import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { TaskRepository } from '../tasks/repositories/task.repository';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, ErrorHandlerService, TaskRepository],
})
export class ExpensesModule {}
