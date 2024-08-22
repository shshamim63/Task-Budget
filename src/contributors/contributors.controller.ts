import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { ContributorsService } from './contributors.service';

import { JWTPayload } from '../interface/auth.interface';

import { CreateContributors } from './dto/create-contributors.dto';
import { User } from '../decorators/user.decorator';
import { Task } from '../tasks/decorators/task.decorator';

import { AuthGuard } from '../auth/guards/auth.guard';

import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';
import { Roles } from '../roles/roles.decorator';
import { UserType } from '@prisma/client';

@Controller('tasks/:taskId/contributors')
@UseGuards(AuthGuard)
@UseInterceptors(TaskInterceptor)
export class ContributorsController {
  constructor(private readonly contributorsService: ContributorsService) {}

  @Post()
  @Roles(UserType.SUPER, UserType.ADMIN)
  assignMember(
    @Body() createContributors: CreateContributors,
    @User() user: JWTPayload,
    @Task() task,
  ) {
    return this.contributorsService.assignMember(
      createContributors,
      user,
      task,
    );
  }
}
