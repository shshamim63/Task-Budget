import { ForbiddenException, Injectable } from '@nestjs/common';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { UserType } from '@prisma/client';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../utils/constants';

@Injectable()
export class TaskPermissionService {
  hasOperationPermission(user: JWTPayload, task: TaskResponseDto): boolean {
    const isSuperUser = user.userType === UserType.SUPER;

    if (isSuperUser) return true;

    const isAdminUser = user.userType === UserType.ADMIN;
    const isTaskCreator = user.id === task.creatorId;

    if (isAdminUser && isTaskCreator) return true;

    throw new ForbiddenException(
      RESPONSE_MESSAGE.PERMISSION_DENIED,
      ERROR_NAME.PERMISSION_DENIED,
    );
  }
}
