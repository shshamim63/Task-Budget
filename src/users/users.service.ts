import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { User } from '@prisma/client';

import { JWTPayload } from '../auth/interfaces/auth.interface';
import {
  UpdatePasswordRequestBody,
  UpdateUserDto,
} from './dto/update-user.dto';

import { UserRepository } from './user.repository';

import { RESPONSE_MESSAGE, USER_RESPONSE_MESSAGE } from '../utils/constants';

@Injectable()
export class UsersService {
  private readonly saltRound = process.env.SALTROUND;

  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(user: JWTPayload): Promise<User> {
    const query = { where: { id: user.id } };
    return await this.userRepository.findUnique(query);
  }

  async updateUserProfile(
    updatePayload: UpdateUserDto,
    user: JWTPayload,
    userId: number,
  ): Promise<User> {
    if (user.id !== userId)
      throw new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED);

    const query = { where: { id: userId } };
    const currentUser = await this.userRepository.findUnique(query);

    if (!currentUser)
      throw new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED);

    const payload = {
      where: { id: user.id },
      data: updatePayload,
    };

    return await this.userRepository.update(payload);
  }

  async updateUserPassword(
    userId: number,
    user: JWTPayload,
    updatePasswordRequestBody: UpdatePasswordRequestBody,
  ) {
    if (user.id !== userId)
      throw new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED);

    const query = { where: { id: userId } };
    const currentUser = await this.userRepository.findUnique(query);

    if (!currentUser)
      throw new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED);

    const { password_hash: hashPassword } = currentUser;
    const isValidPassword = await bcrypt.compare(
      updatePasswordRequestBody.currentPassword,
      hashPassword,
    );

    if (!isValidPassword)
      throw new UnauthorizedException('Invalid credentials');

    const newHashPassword = await bcrypt.hash(
      updatePasswordRequestBody.newPassword,
      Number(this.saltRound),
    );

    const updatePayload = {
      where: { id: userId },
      data: { password_hash: newHashPassword },
    };

    await this.userRepository.update(updatePayload);

    return USER_RESPONSE_MESSAGE.UPDATE_PASSWORD;
  }
}
