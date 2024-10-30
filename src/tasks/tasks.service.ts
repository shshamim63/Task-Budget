import {
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
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CustomError } from '../common/exceptions/custom-error.exception';
import { TaskPermissionService } from '../helpers/task-permission-helper.service';
import { TASK_RESPONSE_MESSAGE } from '../utils/constants';

@Injectable()
export class TasksService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly taskPermissionService: TaskPermissionService,
  ) {}

  async getTasks(
    user: JWTPayload,
    filterDto?: GetTasksFilterDto,
  ): Promise<TaskResponseDto[]> {
    const { status, search } = filterDto;
    const baseCondition = {
      ...(status && { status: status }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const isSuperUser = user.userType === UserType.SUPER;
    const isAdminUser = user.userType === UserType.ADMIN;

    let whereCondition: Prisma.TaskWhereInput;

    if (isSuperUser) {
      whereCondition = baseCondition;
    } else if (isAdminUser) {
      whereCondition = {
        OR: [
          { creatorId: user.id },
          {
            members: {
              some: {
                memberId: user.id,
              },
            },
          },
        ],
        ...baseCondition,
      };
    } else {
      whereCondition = {
        members: {
          some: {
            memberId: user.id,
          },
        },
        ...baseCondition,
      };
    }

    const searchCriteria = {
      where: whereCondition,
    };

    const tasks = await this.prismaService.task.findMany(searchCriteria);

    return tasks ? tasks.map((task) => new TaskResponseDto(task)) : [];
  }

  async getTaskById(id: number, user: JWTPayload): Promise<TaskResponseDto> {
    const isSuperUser = user.userType === UserType.SUPER;

    const query: Prisma.TaskWhereInput = {
      id,
      ...(!isSuperUser && {
        OR: [
          { creatorId: user.id },
          {
            members: {
              some: {
                memberId: user.id,
              },
            },
          },
        ],
      }),
    };

    const task = await this.getFindFirstTask(query);

    if (!task)
      throw new NotFoundException(`Task with id: ${id} does not exist`);

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

    const task = await this.saveTask(data);

    return new TaskResponseDto(task);
  }

  async deleteTask(id: number, user: JWTPayload): Promise<string> | never {
    const currentTask = await this.getCurrentTaskById(id);

    this.taskPermissionService.hasOperationPermission(
      user,
      new TaskResponseDto(currentTask),
    );

    await this.removeTaskById(id);

    return TASK_RESPONSE_MESSAGE.DELETE_TASK;
  }

  async updateTask(
    id: number,
    updateTaskDto: CreateTaskDto,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    const currentTask = await this.getCurrentTaskById(id);

    this.taskPermissionService.hasOperationPermission(
      user,
      new TaskResponseDto(currentTask),
    );

    const updatedTask = await this.updateCurrentTask(id, updateTaskDto);

    return new TaskResponseDto(updatedTask);
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    const currentTask = await this.getCurrentTaskById(id);
    this.taskPermissionService.hasOperationPermission(
      user,
      new TaskResponseDto(currentTask),
    );

    const updatedTask = await this.updateCurrentTask(id, { status: status });
    return new TaskResponseDto(updatedTask);
  }

  private async updateCurrentTask(taskId, data) {
    try {
      const task = await this.prismaService.task.update({
        where: { id: taskId },
        data: data,
      });
      return task;
    } catch (error) {
      this.handleError(error);
    }
  }

  private async removeTaskById(taskId: number) {
    try {
      await this.prismaService.task.delete({ where: { id: taskId } });
    } catch (error) {
      this.handleError(error);
    }
  }

  private async getFindFirstTask(
    query: Prisma.TaskWhereInput,
  ): Promise<Task> | never {
    try {
      const currentTask = await this.prismaService.task.findFirst({
        where: query,
      });
      return currentTask;
    } catch (error) {
      this.handleError(error);
    }
  }

  private async getCurrentTaskById(taskId: number): Promise<Task> | never {
    try {
      const task = await this.prismaService.task.findUniqueOrThrow({
        where: { id: taskId },
      });
      return task;
    } catch (error) {
      this.handleError(error);
    }
  }

  private async saveTask(data) {
    try {
      const task = await this.prismaService.task.create({ data });
      return task;
    } catch (error) {
      this.handleError(error);
    }
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
