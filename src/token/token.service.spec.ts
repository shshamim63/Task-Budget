import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { TokenService } from '../../src/token/token.service';

import {
  AUTHORIZATION_TYPE,
  ERROR_NAME,
  RESPONSE_MESSAGE,
  STATUS_CODE,
} from '../../src/utils/constants';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import {
  mockRequest,
  mockToken,
  mockTokenPayload,
} from './__mock__/token-data.mock';
import { Request } from 'express';

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtSignSpy: jest.SpyInstance;
  let jwtVerifySpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenService],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);

    jwtSignSpy = jest.spyOn(jwt, 'sign').mockImplementation(() => 'mock-token');
    jwtVerifySpy = jest.spyOn(jwt, 'verify');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jwtSignSpy.mockClear();
    jwtVerifySpy.mockClear();
  });

  describe('generateToken', () => {
    it('should generate a token when called', () => {
      const payload = mockTokenPayload();

      const token = tokenService.generateToken(payload);

      expect(token).toBe('mock-token');
      expect(jwtSignSpy).toHaveBeenCalledWith(
        payload,
        process.env.ACCESS_TOKEN,
        {
          expiresIn: '15m',
        },
      );
    });
  });

  describe('verifyToken', () => {
    const validToken = mockToken();
    const invalidToken = mockToken();
    it('should return payload when token is valid', () => {
      const payload = mockTokenPayload();

      jwtVerifySpy.mockReturnValue(payload);

      const result = tokenService.verifyToken(validToken);

      expect(result).toEqual(payload);
      expect(jwtVerifySpy).toHaveBeenCalledWith(
        validToken,
        process.env.ACCESS_TOKEN,
      );
    });

    it('should throw UnauthorizedException if token is expired', () => {
      const error = new Error(RESPONSE_MESSAGE.TOKEN_EXPIRED);
      error.name = ERROR_NAME.TOKEN_EXPIRED;

      jwtVerifySpy.mockImplementation(() => {
        throw error;
      });

      expect(() => tokenService.verifyToken(invalidToken)).toThrow(
        new UnauthorizedException(
          RESPONSE_MESSAGE.TOKEN_EXPIRED,
          ERROR_NAME.TOKEN_EXPIRED,
        ),
      );
    });

    it('should throw UnauthorizedException if token is invalid', () => {
      const error = new Error(RESPONSE_MESSAGE.INVALID_TOKEN);
      error.name = ERROR_NAME.INVALID_TOKEN;

      jwtVerifySpy.mockImplementation(() => {
        throw error;
      });

      expect(() => tokenService.verifyToken(invalidToken)).toThrow(
        new UnauthorizedException(
          RESPONSE_MESSAGE.INVALID_TOKEN,
          ERROR_NAME.INVALID_TOKEN,
        ),
      );
    });

    it('should throw UnauthorizedException for unknown errors', () => {
      const error = new Error();
      error.name = ERROR_NAME.UNKNOWN;

      jwtVerifySpy.mockImplementation(() => {
        throw error;
      });

      expect(() => tokenService.verifyToken(invalidToken)).toThrowError(
        new HttpException(ERROR_NAME.UNKNOWN, STATUS_CODE.UNKNOWN),
      );
    });
  });

  describe('getTokenFromHeader', () => {
    it('should return the token if the header is valid', () => {
      const token = mockToken();
      const request = mockRequest(token);

      const CurrentToken = tokenService.getTokenFromHeader(request);

      expect(CurrentToken).toBe(token);
    });

    it('should return undefined if the authorization type is incorrect', () => {
      const request = {} as Request;

      const token = tokenService.getTokenFromHeader(request);

      expect(token).toBeUndefined();
    });

    it('should return undefined if the authorization header is missing', () => {
      const request = {
        headers: {},
      } as Request;

      const token = tokenService.getTokenFromHeader(request);

      expect(token).toBeUndefined();
    });

    it('should return undefined if the authorization header format is invalid', () => {
      const request = {
        headers: {
          authorization: 'InvalidFormat mock-token',
        },
      } as unknown as Request;

      const token = tokenService.getTokenFromHeader(request);

      expect(token).toBeUndefined();
    });
  });
});
