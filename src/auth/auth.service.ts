import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

import { UserResponseDto } from './dto/user.dto';
import { SignInParams, SignUpParams } from '../interface/auth.interface';
import { TokenSerive } from '../token/token.service';

@Injectable()
export class AuthService {
  private readonly saltRound = process.env.SALTROUND;
  private readonly accessToken = process.env.ACCESS_TOKEN;

  constructor(
    private prismaService: PrismaService,
    private tokenService: TokenSerive,
  ) {}

  async signup(authCredentials: SignUpParams): Promise<UserResponseDto> {
    const { email, password, username } = authCredentials;

    const userExist = await this.prismaService.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (userExist) {
      const errorMessage =
        userExist.email === email
          ? `Account with email ${email}`
          : `Account with username ${username}`;
      throw new ConflictException(errorMessage + ' ' + 'already exist');
    }

    const hashPassword = await bcrypt.hash(password, Number(this.saltRound));

    const data = { email, username, password_hash: hashPassword };
    try {
      const user = await this.prismaService.user.create({ data });
      const token = await this.tokenService.generateToken({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      return new UserResponseDto({ ...user, token });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async signin({ email, password }: SignInParams) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) throw new HttpException('Invalid credentials', 400);

    const hashPassword = user.password_hash;
    const isValidPassword = await bcrypt.compare(password, hashPassword);

    if (!isValidPassword) throw new HttpException('Invalid credentials', 400);

    const token = await this.tokenService.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return new UserResponseDto({ ...user, token });
  }
}
