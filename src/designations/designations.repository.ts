import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { DesignationWithSeletedPayload } from './interface/designation.interface';

@Injectable()
export class DesignationRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async create({
    data,
    select = {},
  }: {
    data: Prisma.DesignationCreateInput;
    select?: Prisma.DesignationSelect;
  }): Promise<DesignationWithSeletedPayload> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.designation.create({
        data,
        ...(select && { select }),
      }),
    );
  }
}
