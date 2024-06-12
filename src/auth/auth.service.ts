import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/auth-credentials.dto';
import { UserResponseDto } from './dto/user.dto';

@Injectable()
export class AuthService {
  private readonly saltRound = process.env.SALTROUND;
  private readonly accessToken = process.env.ACCESS_TOKEN;

  constructor(private prismaService: PrismaService) {}

  async signup(authCredentials: SignUpDto) {
    const { email, password, username } = authCredentials;
    const userExist = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (userExist) throw new ConflictException(`Account with email ${email}`);

    const hashPassword = await bcrypt.hash(password, Number(this.saltRound));

    const data = { email, username, password: hashPassword };
    try {
      const user = await this.prismaService.user.create({ data });
      const token = await jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        this.accessToken,
        {
          expiresIn: '15m',
        },
      );

      return new UserResponseDto({ ...user, token });
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
