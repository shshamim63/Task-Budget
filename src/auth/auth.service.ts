import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async signup(authCredentials: SignUpDto) {
    const { email, password, username } = authCredentials;
    const userExist = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (userExist) throw new ConflictException(`Account with email ${email}`);

    const hashPassword = await bcrypt.hash(password, 10);

    const data = { email, username, password: hashPassword };

    try {
      const user = await this.prismaService.user.create({ data });
      return user;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
