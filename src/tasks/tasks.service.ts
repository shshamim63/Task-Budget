import { Injectable, NotFoundException } from '@nestjs/common';

import { TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskResponseDto } from './dto/task.dto';
import { Prisma, UserType } from '@prisma/client';
import { JWTPayload } from '../auth/interfaces/auth.interface';

import { TaskPermissionService } from '../helpers/task-permission.helper.service';
import { TASK_RESPONSE_MESSAGE } from '../utils/constants';
import { TaskRepository } from './repositories/task.repository';
import { TaskQuery } from './interface/task-response.interface';

@Injectable()
export class TasksService {
  constructor(
    private readonly taskPermissionService: TaskPermissionService,
    private readonly taskRepository: TaskRepository,
  ) {}

  async getTasks(
    user: JWTPayload,
    filterDto?: GetTasksFilterDto,
  ): Promise<TaskResponseDto[]> {
    const query = this.buildGetTasksWhere(user, filterDto);
    const tasks = await this.taskRepository.findMany(query);

    return tasks ? tasks.map((task) => new TaskResponseDto(task)) : [];
  }

  async getTaskById(id: number, user: JWTPayload): Promise<TaskResponseDto> {
    const isSuperUser = user.userType === UserType.SUPER;

    const query: TaskQuery = {
      where: {
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
      },
    };

    const task = await this.taskRepository.findFirst(query);

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

    const task = await this.taskRepository.create(data);

    return new TaskResponseDto(task);
  }

  async deleteTask(id: number, user: JWTPayload): Promise<string> | never {
    const query: TaskQuery = { where: { id: id } };

    const currentTask = await this.taskRepository.findUniqueOrThrow(query);

    this.taskPermissionService.hasOperationPermission(
      user,
      new TaskResponseDto(currentTask),
    );
    await this.taskRepository.delete(query);

    return TASK_RESPONSE_MESSAGE.DELETE_TASK;
  }

  async updateTask(
    id: number,
    updateTaskDto: CreateTaskDto,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    const query: TaskQuery = { where: { id: id } };
    const currentTask = await this.taskRepository.findUniqueOrThrow(query);

    this.taskPermissionService.hasOperationPermission(
      user,
      new TaskResponseDto(currentTask),
    );

    const updatedTask = await this.taskRepository.update(query, updateTaskDto);

    return new TaskResponseDto(updatedTask);
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    const query: TaskQuery = { where: { id: id } };
    const currentTask = await this.taskRepository.findUniqueOrThrow(query);

    this.taskPermissionService.hasOperationPermission(
      user,
      new TaskResponseDto(currentTask),
    );

    const data = { status: status };
    const updatedTask = await this.taskRepository.update(query, data);

    return new TaskResponseDto(updatedTask);
  }

  private buildGetTasksWhere(
    user: JWTPayload,
    filterDto?: GetTasksFilterDto,
  ): TaskQuery {
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

    return searchCriteria;
  }
}
