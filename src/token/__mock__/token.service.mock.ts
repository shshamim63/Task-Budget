import { UnauthorizedException } from '@nestjs/common';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../../utils/constants';
import { mockToken, mockTokenPayload } from './token-data.mock';

export const TokenServiceMock = {
  getTokenFromHeader: jest.fn().mockImplementation(() => mockToken()),
  verifyToken: jest.fn().mockImplementation((token: string) => {
    if (token === 'validToken') {
      return mockTokenPayload();
    }
    throw new UnauthorizedException(
      RESPONSE_MESSAGE.INVALID_TOKEN,
      ERROR_NAME.INVALID_TOKEN,
    );
  }),
  generateToken: jest.fn().mockImplementation(() => mockToken()),
};
