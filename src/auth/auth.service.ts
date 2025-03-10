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
  TokenType,
} from './interfaces/auth.interface';

import { UserRepository } from '../users/user.repository';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../utils/constants';

@Injectable()
export class AuthService {
  private readonly saltRound = process.env.SALTROUND;

  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
  ) {}

  async signup(signUpCredentials: SignUpParams): Promise<UserResponseDto> {
    const { email, password, username, lastName, firstName } =
      signUpCredentials;

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

    const data = {
      email,
      username,
      firstName,
      lastName,
      password_hash: hashPassword,
    };

    const query = {
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
        firstName: true,
        lastName: true,
        active: true,
      },
    };
    const user = (await this.userRepository.create({
      data,
      ...query,
    })) as unknown as AuthUser;

    const payload = this.tokenService.createAuthTokenPayload({ ...user });

    const accessToken = this.tokenService.generateToken(
      payload,
      TokenType.AccessToken,
    );
    const refreshToken = this.tokenService.generateToken(
      payload,
      TokenType.RefreshToken,
    );

    await this.tokenService.saveRefreshToken(user.id, refreshToken);

    return new UserResponseDto({
      ...user,
      accessToken,
      refreshToken,
    });
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
    const accessToken = this.tokenService.generateToken(
      payload,
      TokenType.AccessToken,
    );
    const refreshToken = this.tokenService.generateToken(
      payload,
      TokenType.RefreshToken,
    );

    await this.tokenService.saveRefreshToken(user.id, refreshToken);

    return new UserResponseDto({
      ...user,
      accessToken,
      refreshToken,
    });
  }

  async tokenRefresh(request: Request): Promise<UserResponseDto> {
    let currentRefreshToken = request.cookies.refreshToken;

    if (!currentRefreshToken)
      currentRefreshToken = this.tokenService.getTokenFromHeader(request);

    if (!currentRefreshToken)
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.INVALID_TOKEN,
        ERROR_NAME.INVALID_TOKEN,
      );

    const { email, id: userId } = this.tokenService.verifyToken(
      currentRefreshToken,
      TokenType.RefreshToken,
    );

    const currentSystemToken = this.tokenService.getRefreshToken(
      userId,
      currentRefreshToken,
    );

    if (!currentSystemToken && currentSystemToken !== currentRefreshToken)
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

    const accessToken = this.tokenService.generateToken(
      payload,
      TokenType.AccessToken,
    );

    const authData = {
      ...user,
      accessToken,
      refreshToken: currentRefreshToken,
    };

    return new UserResponseDto(authData);
  }
}
