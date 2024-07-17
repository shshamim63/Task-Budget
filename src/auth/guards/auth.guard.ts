import { CanActivate, ExecutionContext } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';
import { JWTPayload } from '../interface/auth';
import { Request } from 'express';

export class AuthGuard implements CanActivate {
  private readonly accessToken = process.env.ACCESS_TOKEN;
  constructor(private readonly prismaService: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
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

        if (user) return true;
        return false;
      } catch (error) {
        return false;
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request?.headers?.authorization?.split('Bearer ');
    return type === 'Bearer' ? token : undefined;
  }
}
