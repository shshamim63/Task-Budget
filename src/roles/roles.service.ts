import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { Reflector } from '@nestjs/core';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../constants';

@Injectable()
export class RolesService {
  constructor(private reflector: Reflector) {}

  roleValidation(
    permittedRoles: UserType[],
    currentRole: UserType,
  ): boolean | never {
    const hasPermission = permittedRoles.some((role) => role === currentRole);

    if (!hasPermission)
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      );

    return hasPermission;
  }
}
