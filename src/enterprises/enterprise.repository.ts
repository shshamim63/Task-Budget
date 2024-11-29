import { Injectable } from '@nestjs/common';
import { Enterprise } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Injectable()
export class EnterpriseRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async create(data): Promise<Enterprise> {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.enterprise.create({ data }),
    );
  }
}
