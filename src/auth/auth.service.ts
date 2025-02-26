import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { Request } from 'express';

import { TokenService } from '../token/token.service';

import { UserResponseDto } from './dto/user.dto';

import {
  AuthUser,
  SignInParams,
  SignUpParams,
  TokenPayload,
  TokenType,
} from './interfaces/auth.interface';

import { UserRepository } from '../users/user.repository';
import { RedisService } from '../redis/redis.service';
import { ERROR_NAME, RESPONSE_MESSAGE, TOKENS } from '../utils/constants';

@Injectable()
export class AuthService {
  private readonly saltRound = process.env.SALTROUND;

  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
  ) {}

  async signup(signUpCredentials: SignUpParams): Promise<UserResponseDto> {
    const { email, password, username } = signUpCredentials;

    const findQuery = {
      where: {
        OR: [{ email: email }, { username: username }],
      },
    };

    const userExist = await this.userRepository.findFirst(findQuery);

    if (userExist) {
      const errorMessage =
        userExist.email === email
          ? `Account with email ${email}`
          : `Account with username ${username}`;
      throw new ConflictException(errorMessage + ' ' + 'already exist');
    }

    const hashPassword = await bcrypt.hash(password, Number(this.saltRound));

    const data = { email, username, password_hash: hashPassword };
    const query = {
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
      },
    };
    const user = (await this.userRepository.create({
      data,
      ...query,
    })) as unknown as AuthUser;

    const payload = this.tokenService.createAuthTokenPayload({ ...user });

    return await this.generateUserResponse(user, payload, true);
  }

  async signin({ email, password }: SignInParams): Promise<UserResponseDto> {
    const findQuery = {
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password_hash: true,
        userType: true,
      },
    };

    const user = (await this.userRepository.findUnique(
      findQuery,
    )) as unknown as AuthUser;

    if (!user) throw new BadRequestException('Invalid credentials');

    const hashPassword = user.password_hash;
    const isValidPassword = await bcrypt.compare(password, hashPassword);

    if (!isValidPassword)
      throw new UnauthorizedException('Invalid credentials');

    const payload = this.tokenService.createAuthTokenPayload({ ...user });

    return await this.generateUserResponse(user, payload, true);
  }

  async refreshToken(request: Request): Promise<UserResponseDto> {
    let currentRefreshToken = request.cookies.refreshToken;

    if (!currentRefreshToken)
      currentRefreshToken = this.tokenService.getTokenFromHeader(request);

    if (!currentRefreshToken)
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.INVALID_TOKEN,
        ERROR_NAME.INVALID_TOKEN,
      );

    const { email, id } = this.tokenService.verifyToken(
      currentRefreshToken,
      TokenType.RefreshToken,
    );

    const redisToken = await this.redisService.get(`token-user-${id}`);

    if (redisToken !== currentRefreshToken)
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.INVALID_TOKEN,
        ERROR_NAME.INVALID_TOKEN,
      );

    const findQuery = {
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
      },
    };

    const user = (await this.userRepository.findUnique(
      findQuery,
    )) as unknown as AuthUser;

    if (!user) throw new BadRequestException('Invalid Request of the user');

    const payload = this.tokenService.createAuthTokenPayload({ ...user });

    const userInfoWithTokens = await this.generateUserResponse(
      user,
      payload,
      false,
    );

    return { ...userInfoWithTokens, refreshToken: currentRefreshToken };
  }

  private async generateUserResponse(
    user: AuthUser,
    payload: TokenPayload,
    newInstance: boolean,
  ) {
    const accessToken = this.tokenService.generateToken(
      payload,
      TokenType.AccessToken,
    );
    let refreshToken: string;

    if (newInstance) {
      refreshToken = this.tokenService.generateToken(
        payload,
        TokenType.RefreshToken,
      );
      const { duration } = TOKENS[TokenType.RefreshToken];

      await this.redisService.set(
        `token-user-${user.id}`,
        refreshToken,
        duration,
      );
    }

    return new UserResponseDto({
      ...user,
      accessToken,
      ...(newInstance ? { refreshToken } : {}),
    });
  }
}
