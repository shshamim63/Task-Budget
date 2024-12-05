import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthUser, JWTPayload } from '../auth/interfaces/auth.interface';
import { Task, UserType } from '@prisma/client';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../utils/constants';
import { TaskResponseDto } from '../tasks/dto/task.dto';

@Injectable()
export class TaskPermissionService {
  hasTaskCreationPermission(
    currentUser: AuthUser,
    enterpriseId: number,
  ): boolean {
    const isSuperUser = currentUser.userType === UserType.SUPER;

    if (isSuperUser) return true;

    const userCompanions = currentUser.companionOf.map(
      (companion) => companion.id,
    );

    const adminIsACompanion = userCompanions.includes(enterpriseId);

    if (adminIsACompanion) return true;

    throw new ForbiddenException(
      RESPONSE_MESSAGE.PERMISSION_DENIED,
      ERROR_NAME.PERMISSION_DENIED,
    );
  }

  hasOperationPermission(
    user: JWTPayload,
    task: Task | TaskResponseDto,
  ): boolean {
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
