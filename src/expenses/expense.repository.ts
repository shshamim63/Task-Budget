import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Injectable()
export class ExpenseRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async create(createArg) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.create(createArg),
    );
  }
  async findFirst(findFirstArg) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.findFirst(findFirstArg),
    );
  }

  async findUnique(findArg) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.findUnique(findArg),
    );
  }

  async findMany(findManyArg) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.findMany(findManyArg),
    );
  }

  async update(query, data) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.update({ ...query, data }),
    );
  }

  async aggregate(query, aggregateArg) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.aggregate({ ...query, ...aggregateArg }),
    );
  }
}
