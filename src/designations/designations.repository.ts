import { Injectable } from '@nestjs/common';
import { Designation, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Injectable()
export class DesignationRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async create({
    data,
    query = {},
  }: {
    data: Prisma.DesignationCreateInput;
    query?: Prisma.DesignationSelect;
  }): Promise<Designation> {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.designation.create({
        data,
        ...(query && { select: query }),
      }),
    );
  }
}
