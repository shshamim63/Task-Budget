import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { JWTPayload } from '../interface/auth.interface';
import { Request } from 'express';
import { UserType } from '@prisma/client';
import { Reflector } from '@nestjs/core';
import { AUTHORIZATION_TYPE, ROLES_KEY } from '../constants';

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

        console.log(user);

        if (user) return true;

        if (requiredRoles?.length)
          return requiredRoles.some((role) => user.userType?.includes(role));

        return false;
      } catch (error) {
        console.log();
        return false;
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request?.headers?.authorization?.split(' ');
    return type === AUTHORIZATION_TYPE ? token : undefined;
  }
}
