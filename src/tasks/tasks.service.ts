import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ERROR_CODE } from '../prisma/prisma-error-code';
import { TaskResponseDto } from './dto/task.dto';

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
    const { title, description } = createTaskDTO;

    const data = {
      title,
      description,
      status: TaskStatus.OPEN,
      creator_id: userId,
    };

    try {
      const task = await this.prismaService.task.create({ data });
      return new TaskResponseDto(task);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteTask(id: number): Promise<string> {
    try {
      await this.prismaService.task.delete({ where: { id: id } });
      return 'Deteted task';
    } catch (error) {
      if (error.code === ERROR_CODE.doesNotExist)
        throw new NotFoundException(`Record with id: ${id} does not exist`);
    }
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
  ): Promise<TaskResponseDto> {
    const task = await this.prismaService.task.update({
      where: { id: id },
      data: { status: status },
    });
    return new TaskResponseDto(task);
  }
}
