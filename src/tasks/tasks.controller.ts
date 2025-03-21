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
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';

import { UserType } from '@prisma/client';

import { TaskService } from './tasks.service';

import { TaskStatus } from './task.model';

import { TaskResponseDto } from './dto/task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipes';

import { User } from '../decorators/user.decorator';
import { Roles } from '../decorators/roles.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { JWTPayload } from '../auth/interfaces/auth.interface';

@Controller('tasks')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  getTasks(
    @Query(ValidationPipe) filterDto: GetTasksFilterDto,
    @User() user: JWTPayload,
  ): Promise<TaskResponseDto[]> {
    return this.taskService.getTasks(user, filterDto);
  }

  @Get('/:id')
  getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @User() user,
  ): Promise<TaskResponseDto> {
    return this.taskService.getTaskById(id, user);
  }

  @Post()
  @Roles(UserType.ADMIN, UserType.SUPER)
  createTask(
    @Body() createTaskDTO: CreateTaskDto,
    @User() user,
  ): Promise<TaskResponseDto> {
    return this.taskService.createTask(createTaskDTO, user.id);
  }

  @Delete('/:id')
  @Roles(UserType.SUPER, UserType.ADMIN)
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @User() user,
  ): Promise<string> {
    return this.taskService.deleteTask(id, user);
  }

  @Patch('/:id')
  @Roles(UserType.SUPER, UserType.ADMIN)
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: CreateTaskDto,
    @User() user,
  ): Promise<TaskResponseDto> {
    return this.taskService.updateTask(id, updateTaskDto, user);
  }

  @Patch('/:id/status')
  @Roles(UserType.SUPER, UserType.ADMIN)
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    @User() user,
  ): Promise<TaskResponseDto> {
    return this.taskService.updateTaskStatus(id, status, user);
  }
}
