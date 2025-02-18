import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { TokenService } from '../token/token.service';

import { UserResponseDto } from './dto/user.dto';

import {
  AuthUser,
  SignInParams,
  SignUpParams,
} from './interfaces/auth.interface';
import { UserRepository } from '../users/user.repository';

@Injectable()
export class AuthService {
  private readonly saltRound = process.env.SALTROUND;
  private readonly accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  private readonly refresTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
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
    const accessToken = this.tokenService.generateToken(
      payload,
      this.accessTokenSecret,
      '25m',
    );

    const refreshToken = this.tokenService.generateToken(
      payload,
      this.refresTokenSecret,
      '2hr',
    );

    return new UserResponseDto({ ...user, accessToken, refreshToken });
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
      this.accessTokenSecret,
      '25m',
    );

    const refreshToken = this.tokenService.generateToken(
      payload,
      this.refresTokenSecret,
      '2hr',
    );

    return new UserResponseDto({ ...user, accessToken, refreshToken });
  }
}
