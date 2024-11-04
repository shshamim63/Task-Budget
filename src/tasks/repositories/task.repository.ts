import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorHandlerService } from '../../helpers/error.helper.service';
import { TaskResponse } from '../interface/task-response.interface';

@Injectable()
export class TaskRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  async findUnique(query): Promise<TaskResponse> {
    try {
      return await this.prismaService.task.findUnique(query);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }
}
