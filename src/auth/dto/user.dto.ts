import { UserType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
  active: boolean;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password_hash: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
