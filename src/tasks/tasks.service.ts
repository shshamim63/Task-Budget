import { Injectable, NotFoundException } from '@nestjs/common';

import { TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskResponseDto } from './dto/task.dto';
import { Prisma, Task, UserType } from '@prisma/client';
import { JWTPayload } from '../auth/interfaces/auth.interface';

import { TaskPermissionService } from '../helpers/task-permission.helper.service';
import { TASK_RESPONSE_MESSAGE } from '../utils/constants';
import { TaskRepository } from './tasks.repository';
import { AssociateService } from '../associates/associates.service';
import { REDIS_KEYS_FOR_TASK } from '../utils/redis-keys';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TaskService {
  constructor(
    private readonly taskPermissionService: TaskPermissionService,
    private readonly associateService: AssociateService,
    private readonly taskRepository: TaskRepository,
  ) {}

  async getTasks(
    user: JWTPayload,
    filterDto?: GetTasksFilterDto,
  ): Promise<TaskResponseDto[]> {
    const query = this.buildGetTasksWhere<Prisma.TaskFindManyArgs>(
      user,
      filterDto,
    );

    const tasks = await this.taskRepository.findMany(query);

    return tasks ? tasks.map((task) => new TaskResponseDto(task)) : [];
  }

  async getTaskById(id: number, user: JWTPayload): Promise<TaskResponseDto> {
    const query = this.buildGetTaskByIdQuery<Prisma.TaskFindFirstArgs>(
      id,
      user,
    );

    const task = await this.taskRepository.findFirst(query);

    if (!task)
      throw new NotFoundException(`Task with id: ${id} does not exist`);

    return plainToInstance(TaskResponseDto, task);
  }

  async createTask(
    createTaskDTO: CreateTaskDto,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    const { id: userId } = user;
    const { enterpriseId } = createTaskDTO;
    const userAffiliatedTo =
      await this.associateService.userAssociatesTo(userId);

    this.taskPermissionService.hasTaskCreationPermission(
      user,
      enterpriseId,
      userAffiliatedTo,
    );
    const data = this.prepareTaskCreateData(createTaskDTO, userId);
    const task = await this.taskRepository.create({ data });

    return plainToInstance(TaskResponseDto, task);
  }

  async deleteTask(id: number, user: JWTPayload): Promise<string> | never {
    const query = { where: { id } } as Prisma.TaskFindUniqueOrThrowArgs;

    const currentTask = await this.taskRepository.findUniqueOrThrow({ query });

    this.checkPermission(user, currentTask);

    const redisKey = this.generateRedisKey(id);

    await this.taskRepository.delete({ redisKey, query });

    return TASK_RESPONSE_MESSAGE.DELETE_TASK;
  }

  async updateTask(
    id: number,
    updateTaskDto: CreateTaskDto,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    const query: Prisma.TaskFindUniqueOrThrowArgs = { where: { id } };

    const redisKey = this.generateRedisKey(id);
    const currentTask = await this.taskRepository.findUniqueOrThrow({
      redisKey,
      query,
    });

    this.checkPermission(user, currentTask);
    const payload = { ...query, data: updateTaskDto };
    const updatedTask = await this.taskRepository.update({
      redisKey,
      payload,
    });

    return plainToInstance(TaskResponseDto, updatedTask);
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: JWTPayload,
  ): Promise<TaskResponseDto> {
    const query: Prisma.TaskFindUniqueOrThrowArgs = { where: { id } };
    const redisKey = this.generateRedisKey(id);

    const currentTask = await this.taskRepository.findUniqueOrThrow({
      redisKey,
      query,
    });

    this.checkPermission(user, currentTask);

    const data = { status: status };
    const payload = {
      ...query,
      data,
    };
    const updatedTask = await this.taskRepository.update({
      redisKey,
      payload,
    });

    return plainToInstance(TaskResponseDto, updatedTask);
  }

  private buildGetTasksWhere<T>(
    user: JWTPayload,
    filterDto?: GetTasksFilterDto,
  ): T {
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
    } as T;
  }

  private buildGetTaskByIdQuery<T>(id: number, user?: JWTPayload): T {
    const isSuperUser = user.userType === UserType.SUPER;

    return {
      where: {
        id,
        ...(isSuperUser
          ? {}
          : {
              OR: [
                { creatorId: user.id },
                { members: { some: { memberId: user.id } } },
              ],
            }),
      },
    } as T;
  }

  private prepareTaskCreateData(createTaskDTO, userId) {
    const { title, description, budget, enterpriseId } = createTaskDTO;

    return {
      title,
      description,
      status: TaskStatus.OPEN,
      creatorId: userId,
      enterpriseId,
      budget: budget ? new Prisma.Decimal(budget) : undefined,
    };
  }

  private checkPermission(user: JWTPayload, task: Task) {
    this.taskPermissionService.hasOperationPermission(user, task);
  }

  private generateRedisKey(id: number): string {
    return `${REDIS_KEYS_FOR_TASK.TASK_WITH_ID}-${id}`;
  }
}
