import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCollaborator } from './interface/collaborator.interface';

import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

@Injectable()
export class CollaboratorRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private asyncErrorHandlerService: AsyncErrorHandlerService,
  ) {}

  async createMany(data: CreateCollaborator[]) {
    await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.userTask.createMany({ data }),
    );
  }

  async delete(query) {
    await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.userTask.delete(query),
    );
  }

  async findUnique(query) {
    return await this.asyncErrorHandlerService.execute(() =>
      this.prismaService.userTask.findUnique(query),
    );
  }
}
