import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';

import { User, UserType } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';
import { TokenSerive } from '../../token/token.service';
import { RolesService } from '../../roles/roles.service';

import { ERROR_NAME, RESPONSE_MESSAGE, ROLES_KEY } from '../../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly accessToken = process.env.ACCESS_TOKEN;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenSerive,
    private readonly rolesService: RolesService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.tokenService.getTokenFromHeader(request);

    if (!token) return true;

    const payload = this.tokenService.verifyToken(token);
    let user: User;

    try {
      user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
      });

      if (!user)
        throw new UnauthorizedException(
          RESPONSE_MESSAGE.USER_MISSING,
          ERROR_NAME.USER_MISSING,
        );

      const requiredRoles = this.getRoles(context);

      if (!requiredRoles) return true;

      return this.rolesService.roleValidation(requiredRoles, user.userType);
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
}
