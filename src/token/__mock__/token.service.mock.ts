import { mockToken, mockTokenPayload } from './token-data.mock';

export const TokenServiceMock = {
  getTokenFromHeader: jest.fn().mockImplementation(() => mockToken()),
  verifyToken: jest.fn(),
  saveRefreshToken: jest.fn(),
  generateToken: jest.fn().mockImplementation(() => mockToken()),
  createAuthTokenPayload: jest
    .fn()
    .mockImplementation((data) => mockTokenPayload(data)),
  removeToken: jest.fn(),
  getRefreshToken: jest.fn(),
};
