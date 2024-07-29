export interface SignInParams {
  email: string;
  password: string;
}

export interface SignUpParams extends SignInParams {
  username: string;
}

export interface TokenPayload {
  id: number;
  email: string;
  username: string;
}

export interface JWTPayload {
  username: string;
  id: number;
  email: string;
  iat: number;
  exp: number;
}
