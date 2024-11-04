import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCollaborator } from '../interface/collaborator.interface';
import { ErrorHandlerService } from '../../helpers/error.helper.service';

@Injectable()
export class CollaboratorRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  async createMany(data: CreateCollaborator[]) {
    try {
      await this.prismaService.userTasks.createMany({ data });
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }

  async delete(query) {
    try {
      await this.prismaService.userTasks.delete(query);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }
}
