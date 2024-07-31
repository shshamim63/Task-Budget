import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { TasksService } from './tasks.service';

import { TaskStatus } from './task.model';

import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipes';
import { TaskResponseDto } from './dto/task.dto';
import { User } from '../decorators/user.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserType } from '@prisma/client';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(
    @Query(ValidationPipe) filterDto: GetTasksFilterDto,
  ): Promise<TaskResponseDto[]> {
    return this.tasksService.getTasks(filterDto);
  }

  @Get('/:id')
  getTaskById(@Param('id', ParseIntPipe) id: number): Promise<TaskResponseDto> {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  @Roles(UserType.ADMIN, UserType.SUPER)
  createTask(
    @Body() createTaskDTO: CreateTaskDto,
    @User() user,
  ): Promise<TaskResponseDto> {
    return this.tasksService.createTask(createTaskDTO, user.id);
  }

  @Delete('/:id')
  deleteTask(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.tasksService.deleteTask(id);
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
  ): Promise<TaskResponseDto> {
    return this.tasksService.updateTaskStatus(id, status);
  }
}
