import { Request, Response } from 'express';
import { generateMockEncryptedString } from './auth-data.mock';

export const AuthServiceMock = {
  signup: jest.fn(),
  signin: jest.fn(),
  tokenRefresh: jest.fn(),
};

export const ResponseMock = {
  cookie: jest.fn(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as Partial<Response>;

export const RequestMock = {
  headers: {
    authorization: generateMockEncryptedString(),
  },
} as Partial<Request>;
