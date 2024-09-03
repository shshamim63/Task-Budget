import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { TokenSerive } from '../../token/token.service';

import { ERROR_NAME, RESPONSE_MESSAGE, ROLES_KEY } from '../../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly accessToken = process.env.ACCESS_TOKEN;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenSerive,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.tokenService.getTokenFromHeader(request);

    if (!token)
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.MISSING_AUTH,
        ERROR_NAME.MISSING_AUTH,
      );

    const payload = this.tokenService.verifyToken(token);

    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
      });

      if (!user)
        throw new UnauthorizedException(
          RESPONSE_MESSAGE.USER_MISSING,
          ERROR_NAME.USER_MISSING,
        );

      const requiredRoles = this.getRoles(context);

      return requiredRoles
        ? this.validateRoles(requiredRoles, user.userType)
        : true;
    } catch (error) {
      throw error;
    }
  }

  private getRoles(context: ExecutionContext): UserType[] | undefined {
    return this.reflector.getAllAndOverride<UserType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private validateRoles(permittedRoles, currentRole) {
    const hasPermission = permittedRoles.some((role) => role === currentRole);

    if (!hasPermission)
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      );

    return hasPermission;
  }
}
