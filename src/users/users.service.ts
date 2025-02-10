import { Injectable } from '@nestjs/common';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  getProfile(user: JWTPayload) {
    const query = { where: { id: user.id } };
    return this.userRepository.findUnique(query);
  }
}
