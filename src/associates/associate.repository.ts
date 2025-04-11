import { Injectable } from '@nestjs/common';

import { Associate, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { CreateAssociateResult } from './Interfaces/associate.interface';

@Injectable()
export class AssociateRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async create({
    data,
    select = {},
  }: {
    data: Prisma.AssociateCreateInput;
    select?: Prisma.AssociateSelect;
  }): Promise<CreateAssociateResult> {
    return await this.asyncErrorHandlerService.execute<CreateAssociateResult>(
      () =>
        this.prismaService.associate.create({
          data,
          select,
        }),
    );
  }

  async findMany(query: Prisma.AssociateWhereInput): Promise<Associate[]> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.associate.findMany({
        where: query,
      }),
    );
  }
}
