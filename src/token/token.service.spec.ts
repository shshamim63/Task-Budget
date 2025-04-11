import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker/.';

import {
  ERROR_NAME,
  RESPONSE_MESSAGE,
  STATUS_CODE,
  TOKENS,
} from '../../src/utils/constants';

import {
  mockRequest,
  mockToken,
  mockTokenPayload,
} from './__mock__/token-data.mock';
import { TokenRepositoryMock } from './__mock__/token.repository.mock';
import { TokenCacheServiceMock } from './__mock__/token.cache.service.mock';

import { TokenService } from '../../src/token/token.service';
import { TokenType } from '../auth/interfaces/auth.interface';
import { TokenRepository } from './token.repository';
import { TokenCacheService } from './token.cache.service';
import { mockUser } from '../auth/__mock__/auth-data.mock';

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtSignSpy: jest.SpyInstance;
  let jwtVerifySpy: jest.SpyInstance;
  let tokenCacheService: TokenCacheService;
  let tokenRepository: TokenRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: TokenRepository, useValue: TokenRepositoryMock },
        { provide: TokenCacheService, useValue: TokenCacheServiceMock },
      ],
    }).compile();

    tokenService = module.get<TokenService>(TokenService);
    tokenCacheService = module.get<TokenCacheService>(TokenCacheService);
    tokenRepository = module.get<TokenRepository>(TokenRepository);

    jwtSignSpy = jest.spyOn(jwt, 'sign').mockImplementation(() => 'mock-token');
    jwtVerifySpy = jest.spyOn(jwt, 'verify');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a token when called', () => {
      const payload = mockTokenPayload();

      const accessToken = tokenService.generateToken(
        payload,
        TokenType.AccessToken,
      );

      expect(accessToken).toBe('mock-token');
      expect(jwtSignSpy).toHaveBeenCalledWith(
        payload,
        TOKENS[TokenType.AccessToken].secret,
        {
          expiresIn: TOKENS[TokenType.AccessToken].duration,
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

      const result = tokenService.verifyToken(
        validToken,
        TokenType.AccessToken,
      );

      expect(result).toEqual(payload);
      expect(jwtVerifySpy).toHaveBeenCalledWith(
        validToken,
        TOKENS[TokenType.AccessToken].secret,
      );
    });

    it('should throw UnauthorizedException if token is expired', () => {
      const error = new Error(RESPONSE_MESSAGE.TOKEN_EXPIRED);
      error.name = ERROR_NAME.TOKEN_EXPIRED;

      jwtVerifySpy.mockImplementation(() => {
        throw error;
      });

      expect(() =>
        tokenService.verifyToken(invalidToken, TokenType.AccessToken),
      ).toThrow(
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

      expect(() =>
        tokenService.verifyToken(invalidToken, TokenType.AccessToken),
      ).toThrow(
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

      expect(() =>
        tokenService.verifyToken(invalidToken, TokenType.AccessToken),
      ).toThrow(new HttpException(ERROR_NAME.UNKNOWN, STATUS_CODE.UNKNOWN));
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

  describe('saveRefreshToken', () => {
    it('should call tokenRepository.create and tokenCacheService.setRefreshToken', async () => {
      const userId = faker.number.int();
      const token = faker.internet.jwt({ header: { alg: 'HS256' } });
      TokenRepositoryMock.create.mockResolvedValue(true);
      TokenCacheServiceMock.setRefreshToken.mockResolvedValue(true);
      await tokenService.saveRefreshToken(userId, token);
      expect(tokenRepository.create).toHaveBeenCalled();
      expect(tokenCacheService.setRefreshToken).toHaveBeenCalled();
    });
  });

  describe('getRefreshToken', () => {
    it('should not call tokenRepository.findFirst when tokenCacheService.getRefreshToken is called', async () => {
      const userId = faker.number.int();
      const token = faker.internet.jwt({ header: { alg: 'HS256' } });

      TokenCacheServiceMock.getRefreshToken.mockResolvedValue(token);

      await tokenService.getRefreshToken(userId, token);

      expect(tokenCacheService.getRefreshToken).toHaveBeenCalled();
      expect(tokenRepository.findFirst).toHaveBeenCalledTimes(0);
    });

    it('should call tokenRepository.findFirst when tokenCacheService.getRefreshToken returning null', async () => {
      const userId = faker.number.int();
      const token = faker.internet.jwt({ header: { alg: 'HS256' } });

      TokenCacheServiceMock.getRefreshToken.mockResolvedValue(null);
      TokenRepositoryMock.findFirst.mockResolvedValue({ token });

      await tokenService.getRefreshToken(userId, token);

      expect(tokenRepository.findFirst).toHaveBeenCalled();
    });
  });

  describe('removeToken', () => {
    it('should call tokenCacheService.deleteRefreshToken and tokenRepository.delete', async () => {
      const userId = faker.number.int();
      const token = faker.internet.jwt({ header: { alg: 'HS256' } });
      TokenCacheServiceMock.deleteRefreshToken.mockResolvedValue('OK');
      TokenRepositoryMock.delete.mockResolvedValue(true);
      await tokenService.removeToken(userId, token);
      expect(tokenCacheService.deleteRefreshToken).toHaveBeenCalled();
      expect(tokenRepository.delete).toHaveBeenCalled();
    });
  });

  describe('createAuthTokenPayload', () => {
    it('should return active false when active is not given', () => {
      const currentUser = mockUser();
      delete currentUser.active;
      const tokenPayload = tokenService.createAuthTokenPayload(currentUser);
      expect(tokenPayload.active).toBeFalsy();
    });
    it('should return active false when active is not given', () => {
      const currentUser = mockUser();
      const tokenPayload = tokenService.createAuthTokenPayload(currentUser);
      expect(tokenPayload.active).toEqual(currentUser.active);
    });
  });
});
