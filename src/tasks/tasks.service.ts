import { Injectable, NotFoundException } from '@nestjs/common';

import { TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskResponseDto } from './dto/task.dto';
import { Prisma, Task, UserType } from '@prisma/client';
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
    const query = this.buildGetTaskByIdQuery(id, user);
    const task = await this.taskRepository.findFirst(query);

    if (!task)
      throw new NotFoundException(`Task with id: ${id} does not exist`);

    return new TaskResponseDto(task);
  }

  async createTask(
    createTaskDTO: CreateTaskDto,
    userId: number,
  ): Promise<TaskResponseDto> {
    const data = this.prepareTaskCreateData(createTaskDTO, userId);
    const task = await this.taskRepository.create(data);

    return new TaskResponseDto(task);
  }

  async deleteTask(id: number, user: JWTPayload): Promise<string> | never {
    const query: TaskQuery = this.buildGetTaskByIdQuery(id);

    const currentTask = await this.taskRepository.findUniqueOrThrow(query);

    this.checkPermission(user, currentTask);

    await this.taskRepository.delete(query);

    return TASK_RESPONSE_MESSAGE.DELETE_TASK;
  }

  async updateTask(
    id: number,
    updateTaskDto: CreateTaskDto,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    const query: TaskQuery = this.buildGetTaskByIdQuery(id);
    const currentTask = await this.taskRepository.findUniqueOrThrow(query);
    this.checkPermission(user, currentTask);
    const updatedTask = await this.taskRepository.update(query, updateTaskDto);

    return new TaskResponseDto(updatedTask);
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    const query: TaskQuery = this.buildGetTaskByIdQuery(id);
    const currentTask = await this.taskRepository.findUniqueOrThrow(query);

    this.checkPermission(user, currentTask);

    const data = { status: status };
    const updatedTask = await this.taskRepository.update(query, data);

    return new TaskResponseDto(updatedTask);
  }

  private buildGetTasksWhere(
    user: JWTPayload,
    filterDto?: GetTasksFilterDto,
  ): TaskQuery {
    const { status, search } = filterDto || {};
    const isSuperUser = user.userType === UserType.SUPER;
    const isAdminUser = user.userType === UserType.ADMIN;

    const baseCondition = {
      ...(status && { status: status }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const whereCondition: Prisma.TaskWhereInput = isSuperUser
      ? baseCondition
      : {
          OR: isAdminUser
            ? [
                { creatorId: user.id },
                { members: { some: { memberId: user.id } } },
              ]
            : undefined,
          members:
            !isSuperUser && !isAdminUser
              ? { some: { memberId: user.id } }
              : undefined,
          ...baseCondition,
        };

    return {
      where: whereCondition,
    };
  }

  private buildGetTaskByIdQuery(id: number, user?: JWTPayload): TaskQuery {
    const baseQuery: TaskQuery = { where: { id } };

    if (!user) return baseQuery;

    const isSuperUser = user.userType === UserType.SUPER;

    if (!isSuperUser) {
      baseQuery.where.OR = [
        { creatorId: user.id },
        { members: { some: { memberId: user.id } } },
      ];
    }
    return baseQuery;
  }

  private prepareTaskCreateData(createTaskDTO, userId) {
    const { title, description, budget } = createTaskDTO;

    return {
      title,
      description,
      status: TaskStatus.OPEN,
      creatorId: userId,
      budget: budget ? new Prisma.Decimal(budget) : undefined,
    };
  }

  private checkPermission(user: JWTPayload, task: Task) {
    this.taskPermissionService.hasOperationPermission(user, task);
  }
}
