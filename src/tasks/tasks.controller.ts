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

import { UserType } from '@prisma/client';

import { TasksService } from './tasks.service';

import { TaskStatus } from './task.model';

import { TaskResponseDto } from './dto/task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipes';

import { User } from '../decorators/user.decorator';
import { Roles } from '../decorators/roles.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tasks')
@UseGuards(AuthGuard, RolesGuard)
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
  @Roles(UserType.SUPER, UserType.ADMIN)
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @User() user,
  ): Promise<string> {
    return this.tasksService.deleteTask(id, user);
  }

  @Patch('/:id')
  @Roles(UserType.SUPER, UserType.ADMIN)
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: CreateTaskDto,
    @User() user,
  ): Promise<TaskResponseDto> {
    return this.tasksService.updateTask(id, updateTaskDto, user);
  }

  @Patch('/:id/status')
  @Roles(UserType.SUPER, UserType.ADMIN)
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    @User() user,
  ): Promise<TaskResponseDto> {
    return this.tasksService.updateTaskStatus(id, status, user);
  }
}
