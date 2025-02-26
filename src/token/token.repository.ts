import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TokenRepository {
  constructor(
    private readonly prismaService: PrismaService,

    private asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async create(createArg: Prisma.ExpenseCreateArgs) {
    await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.create(createArg),
    );
  }

  async delete(createArg: Prisma.ExpenseCreateArgs) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.expense.create(createArg),
    );
  }
}
