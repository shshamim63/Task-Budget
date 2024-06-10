import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { Task, TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ERROR_CODE } from 'src/prisma/prisma-error-code';

@Injectable()
export class TasksService {
  constructor(private prismaService: PrismaService) {}

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
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
    return tasks;
  }

  async getTaskById(id: number): Promise<Task> {
    const task = await this.prismaService.task.findUnique({
      where: { id: id },
    });
    if (!task) throw new NotFoundException(`Task with id: ${id} not found`);
    return task;
  }

  async createTask(createTaskDTO: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDTO;
    const data = {
      title,
      description,
      status: TaskStatus.OPEN,
    };
    try {
      const task = await this.prismaService.task.create({ data });
      return task;
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

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    const task = await this.prismaService.task.update({
      where: { id: id },
      data: { status: status },
    });
    return task;
  }
}
