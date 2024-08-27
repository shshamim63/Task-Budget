import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { JWTPayload } from '../interface/auth.interface';

import { CreateCollaborators } from './dto/create-collaborators.dto';
import { User } from '../decorators/user.decorator';
import { Task } from '../tasks/decorators/task.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';

import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';
import { Roles } from '../roles/roles.decorator';
import { UserType } from '@prisma/client';
import { CollaboratorsService } from './collaborators.service';

@Controller('tasks/:taskId/collaborators')
@UseGuards(AuthGuard)
@UseInterceptors(TaskInterceptor)
export class CollaboratorsController {
  constructor(private readonly collaboratorsService: CollaboratorsService) {}

  @Post()
  @Roles(UserType.SUPER, UserType.ADMIN)
  assignMember(
    @Body() createCollaborators: CreateCollaborators,
    @User() user: JWTPayload,
    @Task() task,
  ) {
    return this.collaboratorsService.assignMember(
      createCollaborators,
      user,
      task,
    );
  }
}
