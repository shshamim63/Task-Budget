import { Module } from '@nestjs/common';

import { TokenModule } from '../token/token.module';
import { PrismaModule } from '../prisma/prisma.module';

import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
