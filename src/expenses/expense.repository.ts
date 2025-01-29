import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpenseRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async create(createArg: Prisma.ExpenseCreateArgs) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.create(createArg),
    );
  }
  async findFirst(findFirstArg: Prisma.ExpenseFindFirstArgs) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.findFirst(findFirstArg),
    );
  }

  async findUnique(findArg: Prisma.ExpenseFindUniqueArgs) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.findUnique(findArg),
    );
  }

  async findMany(findManyArg: Prisma.ExpenseFindManyArgs) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.findMany(findManyArg),
    );
  }

  async update(payload: Prisma.ExpenseUpdateArgs) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.update(payload),
    );
  }

  async aggregate(query, aggregateArg) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.aggregate({ ...query, ...aggregateArg }),
    );
  }
}
