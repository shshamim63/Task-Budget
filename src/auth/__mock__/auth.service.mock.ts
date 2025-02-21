import { Response } from 'express';

export const AuthServiceMock = {
  signup: jest.fn(),
  signin: jest.fn(),
};

export const ResponseMock = {
  cookie: jest.fn(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as Partial<Response>;
