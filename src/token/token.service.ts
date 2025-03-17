import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  AuthUser,
  JWTPayload,
  TokenPayload,
  TokenType,
} from '../auth/interfaces/auth.interface';
import {
  AUTHORIZATION_TYPE,
  ERROR_NAME,
  RESPONSE_MESSAGE,
  STATUS_CODE,
  TOKENS,
} from '../utils/constants';
import { TokenRepository } from './token.repository';
import { RedisService } from '../redis/redis.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TokenService {
  constructor(
    private readonly tokenRepository: TokenRepository,
    private readonly redisService: RedisService,
  ) {}

  generateToken(payload: TokenPayload, secretType: string): string {
    const { secret, duration } = TOKENS[secretType];

    const token = jwt.sign(payload, secret, {
      expiresIn: duration,
    });

    return token;
  }

  verifyToken(token: string, secretType: string): JWTPayload {
    const { secret } = TOKENS[secretType];

    try {
      return jwt.verify(token, secret) as JWTPayload;
    } catch (error) {
      let errorResponse: string;
      let errorName: string;
      switch (error.name) {
        case ERROR_NAME.TOKEN_EXPIRED:
          errorResponse = RESPONSE_MESSAGE.TOKEN_EXPIRED;
          errorName = ERROR_NAME.TOKEN_EXPIRED;
          break;
        case ERROR_NAME.INVALID_TOKEN:
          errorResponse = RESPONSE_MESSAGE.INVALID_TOKEN;
          errorName = ERROR_NAME.INVALID_TOKEN;
          break;
        default:
          throw new HttpException(ERROR_NAME.UNKNOWN, STATUS_CODE.UNKNOWN);
      }
      throw new UnauthorizedException(errorResponse, errorName);
    }
  }

  getTokenFromHeader(request: Request): string | undefined {
    const authorizationToken = request?.headers?.authorization;

    if (authorizationToken) {
      const [type, token] = authorizationToken.split(' ');
      return type === AUTHORIZATION_TYPE ? token : undefined;
    }

    return undefined;
  }

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    const { ttl } = TOKENS[TokenType.RefreshToken];
    const data = { userId, token };
    await this.tokenRepository.create({ data });
    await this.redisService.set(`token-user-${userId}`, token, ttl);
  }

  async getRefreshToken(userId: number, token: string) {
    const redisRefreshToken = await this.redisService.get(
      `token-user-${userId}`,
    );

    if (redisRefreshToken) return redisRefreshToken;

    const oneHourAgo = new Date(
      Date.now() - TOKENS.refresTokenSecret.ttl * 1000,
    );

    const query = {
      where: {
        userId,
        token,
        createdAt: {
          gte: oneHourAgo,
        },
      },
      select: {
        token: true,
      },
    } as Prisma.RefreshTokenFindFirstArgs;

    const savedRefreshToken = await this.tokenRepository.findFirst(query);

    return savedRefreshToken?.token;
  }

  async removeToken(userId: number, token: string) {
    await this.redisService.del(`token-user-${userId}`);

    const query = {
      where: {
        userId_token: {
          userId,
          token,
        },
      },
    };

    await this.tokenRepository.delete(query);
  }

  createAuthTokenPayload(data: AuthUser): TokenPayload {
    const { id, email, username, userType, active } = data;
    return {
      id,
      email,
      username,
      userType,
      active: active ?? false,
    };
  }
}
