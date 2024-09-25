import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { Observable } from 'rxjs';
import { ERROR_NAME, RESPONSE_MESSAGE, ROLES_KEY } from '../../utils/constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const roles = this.reflector.getAllAndOverride<UserType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return roles ? this.validateRoles(roles, user.userType) : true;
  }

  private validateRoles(permittedRoles, currentRole) {
    const hasPermission = permittedRoles.some((role) => role === currentRole);

    if (!hasPermission)
      throw new ForbiddenException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      );

    return hasPermission;
  }
}
