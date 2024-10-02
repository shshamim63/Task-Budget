import { JWTPayload } from '../auth/interfaces/auth.interface';

declare module 'express' {
  export interface Request {
    user?: JWTPayload;
  }
}
