import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UserRepository } from '../../users/user.repository';

import { AuthUser } from '../interfaces/auth.interface';

import { TokenService } from '../../token/token.service';
import { RedisService } from '../../redis/redis.service';

import {
  REDIS_KEYS_FOR_USER,
  REDIS_TTL_IN_MILISECONDS,
} from '../../utils/redis-keys';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../../utils/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.tokenService.getTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.MISSING_AUTH,
        ERROR_NAME.MISSING_AUTH,
      );
    }

    const payload = this.tokenService.verifyToken(token);

    if (!payload) {
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.INVALID_TOKEN,
        ERROR_NAME.INVALID_TOKEN,
      );
    }

    const user = await this.getUser(payload.id);

    if (!user) {
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.USER_MISSING,
        ERROR_NAME.USER_MISSING,
      );
    }

    const currentPayload = this.tokenService.createAuthTokenPayload({
      ...user,
    });

    request.user = currentPayload;
    return true;
  }

  private async getUser(userId: number): Promise<AuthUser> {
    const redisUser = await this.redisService.get(
      `${REDIS_KEYS_FOR_USER.AUTH_USER}:${userId}`,
    );

    if (redisUser) return JSON.parse(redisUser);

    const user = (await this.userRepository.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
      },
    })) as unknown as AuthUser;

    await this.redisService.set(
      `auth-user:${userId}`,
      JSON.stringify(user),
      REDIS_TTL_IN_MILISECONDS,
    );

    return user;
  }
}
