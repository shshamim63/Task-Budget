import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JWTPayload } from '../auth/interfaces/auth.interface';

import { CreateCollaboratorsDto } from './dto/create-collaborators.dto';
import { User } from '../decorators/user.decorator';
import { Task } from '../tasks/decorators/task.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';

import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';
import { Roles } from '../decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { CollaboratorsService } from './collaborators.service';
import { TaskResponseDto } from '../tasks/dto/task.dto';

@Controller('tasks/:taskId/collaborators')
@UseGuards(AuthGuard)
@UseInterceptors(TaskInterceptor)
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Get()
  @Roles(UserType.SUPER, UserType.ADMIN)
  getCollaborators(@User() user: JWTPayload, @Task() task: TaskResponseDto) {
    return this.collaboratorsService.getCollaborators(user, task);
  }

  @Post()
  @Roles(UserType.SUPER, UserType.ADMIN)
  assignMember(
    @Body() createCollaboratorsDto: CreateCollaboratorsDto,
    @User() user: JWTPayload,
    @Task() task: TaskResponseDto,
  ): Promise<string> {
    return this.collaboratorsService.assignMember(
      createCollaboratorsDto,
      user,
      task,
    );
  }

  @Delete('/collaboratorId')
  @Roles(UserType.SUPER, UserType.ADMIN)
  removeCollaborator(
    @Param('collaboratorId', ParseIntPipe) collaboratorId: number,
    @User() user: JWTPayload,
    @Task() task: TaskResponseDto,
  ): Promise<string> {
    return this.collaboratorsService.removeCollaborator(
      user,
      task,
      collaboratorId,
    );
  }
}
