import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  id: number;
  username: string;
  email: string;
  token: string;
  @Exclude()
  password: string;
  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;

  @Expose({ name: 'createdAt' })
  transformCreatedAt() {
    return this.created_at;
  }

  @Expose({ name: 'updatedAt' })
  transformUpdatedAt() {
    return this.updated_at;
  }

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
