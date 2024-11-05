import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorHandlerService } from '../../helpers/error.helper.service';
import { TaskResponse } from '../interface/task-response.interface';
import { Task } from '@prisma/client';

@Injectable()
export class TaskRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  async findFirst(query): Promise<Task> {
    try {
      return await this.prismaService.task.findFirst(query);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }

  async findUnique(query): Promise<TaskResponse> {
    try {
      return await this.prismaService.task.findUnique(query);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }

  async findUniqueOrThrow(query): Promise<Task> | never {
    try {
      return await this.prismaService.task.findUniqueOrThrow(query);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }

  async findMany(query): Promise<TaskResponse[]> {
    try {
      return await this.prismaService.task.findMany(query);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }

  async create(data): Promise<Task> {
    try {
      return await this.prismaService.task.create({ data });
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }

  async delete(query): Promise<void> {
    try {
      await this.prismaService.task.delete(query);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }

  async update(query, data): Promise<Task> {
    try {
      return await this.prismaService.task.update({
        ...query,
        data,
      });
    } catch (error) {
      this.errorHandlerService.handle(error);
    }
  }
}
