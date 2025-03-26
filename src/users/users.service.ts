import { Injectable } from '@nestjs/common';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { UserRepository } from './user.repository';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async getProfile(user: JWTPayload): Promise<User> {
    const query = { where: { id: user.id } };
    return await this.userRepository.findUnique(query);
  }

  async updateUserProfile(
    updatePayload: UpdateUserDto,
    user: JWTPayload,
  ): Promise<User> {
    const payload = {
      where: { id: user.id },
      data: updatePayload,
    };

    return await this.userRepository.update(payload);
  }
}
