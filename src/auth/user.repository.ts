import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async findFirst(query: Prisma.UserFindFirstArgs) {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.findFirst(query),
    );
  }

  async findUnique(query: Prisma.UserFindUniqueArgs) {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.findUnique(query),
    );
  }

  async findMany(query: Prisma.UserFindManyArgs) {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.findMany(query),
    );
  }

  async create(data) {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.create({ data }),
    );
  }
}
