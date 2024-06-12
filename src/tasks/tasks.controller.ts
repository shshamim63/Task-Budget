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
import { User } from 'src/auth/decorators/user.decorators';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @UseGuards(AuthGuard)
  getTasks(
    @Query(ValidationPipe) filterDto: GetTasksFilterDto,
    @User() user,
  ): Promise<TaskResponseDto[]> {
    console.log(user);
    return this.tasksService.getTasks(filterDto);
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  getTaskById(@Param('id', ParseIntPipe) id: number): Promise<TaskResponseDto> {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  createTask(
    @Body() createTaskDTO: CreateTaskDto,
    @User() user,
  ): Promise<TaskResponseDto> {
    return this.tasksService.createTask(createTaskDTO, user.id);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard)
  deleteTask(@Param('id', ParseIntPipe) id: number): Promise<string> {
    return this.tasksService.deleteTask(id);
  }

  @Patch('/:id/status')
  @UseGuards(AuthGuard)
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
  ): Promise<TaskResponseDto> {
    return this.tasksService.updateTaskStatus(id, status);
  }
}
