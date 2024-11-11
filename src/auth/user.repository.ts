import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async findFirst(query) {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.findFirst(query),
    );
  }

  async findUnique(query) {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.findUnique(query),
    );
  }

  async findMany(query) {
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
