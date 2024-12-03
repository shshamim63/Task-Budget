import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { Associate, Prisma } from '@prisma/client';

@Injectable()
export class AssociateRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async create({
    data,
    query = {},
  }: {
    data: Prisma.AssociateCreateInput;
    query?: Prisma.AssociateSelect;
  }): Promise<Associate> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.associate.create({
        data,
        ...(query && { select: query }),
      }),
    );
  }
}
