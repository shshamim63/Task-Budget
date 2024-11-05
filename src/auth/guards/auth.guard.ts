import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { TokenSerive } from '../../token/token.service';

import { ERROR_NAME, RESPONSE_MESSAGE } from '../../utils/constants';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly accessToken = process.env.ACCESS_TOKEN;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenSerive,
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

    const user = await this.userRepository.findUnique({
      where: { id: payload.id },
    });

    if (!user)
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.USER_MISSING,
        ERROR_NAME.USER_MISSING,
      );

    request.user = payload;
    return true;
  }
}
