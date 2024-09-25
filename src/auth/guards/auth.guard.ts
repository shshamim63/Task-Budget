import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { PrismaService } from '../../prisma/prisma.service';
import { TokenSerive } from '../../token/token.service';

import { ERROR_NAME, RESPONSE_MESSAGE } from '../../utils/constants';

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

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.id },
    });

    request.user = payload;

    if (!user)
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.USER_MISSING,
        ERROR_NAME.USER_MISSING,
      );

    return true;
  }
}
