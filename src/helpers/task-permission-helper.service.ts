import { Injectable } from '@nestjs/common';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { UserType } from '@prisma/client';

@Injectable()
export class TaskPermissionService {
  hasOperationPermission(user: JWTPayload, task: TaskResponseDto): boolean {
    const isSuperUser = user.userType === UserType.SUPER;

    if (isSuperUser) return true;

    const isAdminUser = user.userType === UserType.ADMIN;
    const isTaskCreator = user.id === task.creatorId;

    if (isAdminUser && isTaskCreator) return true;

    return false;
  }
}
