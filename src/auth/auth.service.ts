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
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  private readonly saltRound = process.env.SALTROUND;

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
        companionOf: {
          select: {
            id: true,
          },
        },
      },
    };
    const user = (await this.userRepository.create({
      data,
      ...query,
    })) as unknown as AuthUser;

    const payload = this.tokenService.createAuthTokenPayload({ ...user });
    const token = this.tokenService.generateToken(payload);
    return new UserResponseDto({ ...user, token });
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
        companionOf: {
          select: {
            id: true,
          },
        },
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

    const token = this.tokenService.generateToken(payload);

    return new UserResponseDto({ ...user, token });
  }
}
