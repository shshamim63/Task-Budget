import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: number;
  username: string;
  email: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;

  @Exclude()
  password_hash: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
