import { UserType } from '@prisma/client';
import { User } from '../../decorators/user.decorator';

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignUpParams extends SignInParams {
  username: string;
}

export interface TokenPayload {
  email: string;
  id: number;
  username: string;
  userType: UserType;
}

export interface JWTPayload extends TokenPayload {
  exp: number;
  iat: number;
}

export type AuthUser = typeof User;
