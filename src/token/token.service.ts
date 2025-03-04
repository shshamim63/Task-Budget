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

  async saveRefreshToken(id: number, token: string): Promise<void> {
    const data = { userId: id, token };
    await this.tokenRepository.create({ data });
  }

  async getRefreshToken(userId: number, token: string) {
    const redisRefreshToken = await this.redisService.get(
      `token-user-${userId}`,
    );

    if (redisRefreshToken) return redisRefreshToken;

    const oneHourAgo = new Date(Date.now() - TOKENS.refresTokenSecret.duration);

    const query = {
      where: {
        id: userId,
        token,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    } as Prisma.RefreshTokenFindFirstArgs;

    const savedRefreshToken = this.tokenRepository.findFirst(query);

    return savedRefreshToken;
  }

  createAuthTokenPayload(data: AuthUser): TokenPayload {
    const { id, email, username, userType } = data;
    return {
      id,
      email,
      username,
      userType,
    };
  }
}
