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

  async findFirst(query: Prisma.RefreshTokenFindFirstArgs) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.refreshToken.findFirst(query),
    );
  }

  async create(createArg: Prisma.RefreshTokenCreateArgs) {
    await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.refreshToken.create(createArg),
    );
  }

  async delete(deleteArg: Prisma.RefreshTokenDeleteArgs) {
    await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.refreshToken.delete(deleteArg),
    );
  }
}
