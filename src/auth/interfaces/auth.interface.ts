import { Prisma, UserType } from '@prisma/client';

export interface SignInParams {
  email: string;
  password: string;
}

export interface SignUpParams extends SignInParams {
  username: string;
  firstName: string;
  lastName: string;
}

export interface TokenPayload {
  email: string;
  id: number;
  username: string;
  userType: UserType;
  active: boolean;
}

export interface JWTPayload extends TokenPayload {
  exp: number;
  iat: number;
}

export type AuthUser = Omit<
  Prisma.UserGetPayload<{
    select: {
      id: true;
      email: true;
      username: true;
      userType: true;
      password_hash: true;
      active: true;
    };
  }>,
  'password_hash'
> & {
  password_hash?: string;
};

export type AuthUserInfo = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    username: true;
    userType: true;
    password_hash: true;
    active: true;
    firstName: true;
    lastName: true;
  };
}> & { accessToken: string; refreshToken: string };

export enum TokenType {
  AccessToken = 'accessTokenSecret',
  RefreshToken = 'refresTokenSecret',
}
