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

@Injectable()
export class TokenService {
  constructor() {}

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
