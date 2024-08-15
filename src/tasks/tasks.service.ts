import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PRISMA_ERROR_CODE } from '../prisma/prisma-error-code';
import { TaskResponseDto } from './dto/task.dto';
import { Prisma, Task, UserType } from '@prisma/client';
import { JWTPayload } from '../interface/auth.interface';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../constants';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomError } from '../common/exceptions/custom-error.exception';

@Injectable()
export class TasksService {
  constructor(private prismaService: PrismaService) {}

  async getTasks(filterDto: GetTasksFilterDto): Promise<TaskResponseDto[]> {
    const where: any = {};

    if (Object.keys(filterDto).length) {
      const { status, search } = filterDto;
      if (status) where.status = status;
      if (search)
        where.OR = [
          {
            title: { contains: search },
          },
          { description: { contains: search } },
        ];
    }
    const tasks = await this.prismaService.task.findMany({ where });
    return tasks.map((task) => new TaskResponseDto(task));
  }

  async getTaskById(id: number): Promise<TaskResponseDto> {
    const task = await this.prismaService.task.findUnique({
      where: { id: id },
    });
    if (!task) throw new NotFoundException(`Task with id: ${id} not found`);
    return new TaskResponseDto(task);
  }

  async createTask(
    createTaskDTO: CreateTaskDto,
    userId: number,
  ): Promise<TaskResponseDto> {
    const { title, description, budget } = createTaskDTO;

    const data = {
      title,
      description,
      status: TaskStatus.OPEN,
      creatorId: userId,
      budget: budget ? new Prisma.Decimal(budget) : undefined,
    };

    try {
      const task = await this.prismaService.task.create({ data });
      return new TaskResponseDto(task);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteTask(id: number, user: JWTPayload): Promise<string> | never {
    try {
      const task = await this.prismaService.task.findUniqueOrThrow({
        where: { id: id },
      });
      this.hasOperationPermission(task, user);
      await this.prismaService.task.delete({ where: { id: id } });
      return 'Detete task success';
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateTask(
    id: number,
    updateTaskDto: CreateTaskDto,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    try {
      const task = await this.prismaService.task.findUniqueOrThrow({
        where: { id: id },
      });
      this.hasOperationPermission(task, user);
      const currentTask = await this.prismaService.task.update({
        where: { id: id },
        data: updateTaskDto,
      });
      return new TaskResponseDto(currentTask);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    try {
      const task = await this.prismaService.task.findUniqueOrThrow({
        where: { id: id },
      });
      this.hasOperationPermission(task, user);
      const updatedTask = await this.prismaService.task.update({
        where: { id: id },
        data: { status: status },
      });
      return new TaskResponseDto(updatedTask);
    } catch (error) {
      this.handleError(error);
    }
  }

  private hasOperationPermission(
    task: Task,
    user: JWTPayload,
  ): boolean | never {
    console.log(task.creatorId, user.id, user.userType !== UserType.SUPER);
    if (user.userType === UserType.SUPER) return true;

    if (task.creatorId === user.id) return true;

    throw new ForbiddenException(
      RESPONSE_MESSAGE.PERMISSION_DENIED,
      ERROR_NAME.PERMISSION_DENIED,
    );
  }

  private handleError(error: CustomError): never {
    if (error instanceof PrismaClientKnownRequestError) {
      const { response, status } = PRISMA_ERROR_CODE[error.code];
      throw new HttpException(response, status);
    } else if (error instanceof HttpException) {
      throw error;
    } else {
      throw new InternalServerErrorException(error.message);
    }
  }
}
