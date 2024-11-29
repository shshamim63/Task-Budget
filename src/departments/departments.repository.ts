import { Injectable } from '@nestjs/common';
import { Department, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Injectable()
export class DepartmentRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async create({
    data,
  }: {
    data: Prisma.DepartmentCreateInput;
    query?: Prisma.DepartmentSelect;
  }): Promise<Department> {
    return this.asyncErrorHandlerService.execute(() =>
      this.prismaService.department.create({
        data,
      }),
    );
  }
}
