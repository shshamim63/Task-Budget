import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { JWTPayload } from '../interface/auth.interface';
import { Request } from 'express';
import { UserType } from '@prisma/client';
import { Reflector } from '@nestjs/core';
import {
  AUTHORIZATION_TYPE,
  ERROR_NAME,
  RESPONSE_MESSAGE,
  ROLES_KEY,
} from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly accessToken = process.env.ACCESS_TOKEN;

  constructor(
    private readonly prismaService: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        const payload = (await jwt.verify(
          token,
          this.accessToken,
        )) as JWTPayload;

        const user = await this.prismaService.user.findUnique({
          where: { id: payload.id },
        });

        if (user && requiredRoles?.length)
          return requiredRoles.some((role) => user.userType?.includes(role));

        if (user) return true;

        return false;
      } catch (error) {
        let errorResponse: string;
        let errorName: string;
        if (error.name === ERROR_NAME.TOKEN_EXPIRED) {
          errorResponse = RESPONSE_MESSAGE.TOKEN_EXPIRED;
          errorName = ERROR_NAME.TOKEN_EXPIRED;
        } else if (error.name === ERROR_NAME.INVALID_TOKEN) {
          errorResponse = RESPONSE_MESSAGE.INVALID_TOKEN;
          errorName = ERROR_NAME.INVALID_TOKEN;
        } else {
          return false;
        }
        throw new UnauthorizedException(errorResponse, errorName);
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request?.headers?.authorization?.split(' ');
    return type === AUTHORIZATION_TYPE ? token : undefined;
  }
}
