import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async findFirst(query: Prisma.UserFindFirstArgs): Promise<User> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.findFirst(query),
    );
  }

  async findUnique(query: Prisma.UserFindUniqueArgs): Promise<User> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.findUnique(query),
    );
  }

  async findMany(query: Prisma.UserFindManyArgs): Promise<User[]> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.findMany(query),
    );
  }

  async create(data: Prisma.UserCreateArgs): Promise<User> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.create(data),
    );
  }

  async update(payload: Prisma.UserUpdateArgs): Promise<User> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.user.update(payload),
    );
  }
}
