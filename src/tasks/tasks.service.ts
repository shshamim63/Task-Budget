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
import { Prisma, UserType } from '@prisma/client';
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

    let searchCiteria = {};

    if (user.userType === UserType.SUPER) {
      searchCiteria = {
        where: {
          ...baseCondition,
        },
      };
    } else if (user.userType === UserType.ADMIN) {
      searchCiteria = {
        where: {
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
        },
      };
    } else {
      searchCiteria = {
        where: {
          members: {
            some: {
              memberId: user.id,
            },
          },
          ...baseCondition,
        },
      };
    }

    const tasks = await this.prismaService.task.findMany(searchCiteria);

    return tasks ? tasks.map((task) => new TaskResponseDto(task)) : [];
  }

  async getTaskById(id: number, user: JWTPayload): Promise<TaskResponseDto> {
    let baseCondition: any = { id: id };
    if (user.userType !== UserType.SUPER) {
      baseCondition = {
        ...baseCondition,
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
      };
    }

    const task = await this.prismaService.task.findFirst({
      where: baseCondition,
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
      this.taskPermissionService.hasOperationPermission(
        user,
        new TaskResponseDto(task),
      );
      await this.prismaService.task.delete({ where: { id: id } });
      return TASK_RESPONSE_MESSAGE.DELETE_TASK;
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
      this.taskPermissionService.hasOperationPermission(
        user,
        new TaskResponseDto(task),
      );
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

      this.taskPermissionService.hasOperationPermission(
        user,
        new TaskResponseDto(task),
      );

      const updatedTask = await this.prismaService.task.update({
        where: { id: id },
        data: { status: status },
      });
      return new TaskResponseDto(updatedTask);
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
