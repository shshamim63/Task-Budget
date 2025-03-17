import { Request } from 'express';

import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { faker } from '@faker-js/faker/.';

import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';

import { UserRepository } from '../users/user.repository';

import { TokenType } from './interfaces/auth.interface';

import { ERROR_NAME, RESPONSE_MESSAGE } from '../utils/constants';

import { RedisService } from '../redis/redis.service';

import { TokenServiceMock } from '../token/__mock__/token.service.mock';
import {
  generateMockEncryptedString,
  mockSignInRequestBody,
  mockSignUpRequestBody,
  mockUser,
} from './__mock__/auth-data.mock';
import { UserRepositoryMock } from '../users/__mock__/user.repository.mock';

import { RedisServiceMock } from '../redis/__mock__/redis.service.mock';
import { RequestMock } from './__mock__/auth.service.mock';

describe('AuthService', () => {
  let service: AuthService;
  let tokenService: TokenService;
  let userRepository: UserRepository;

  let hashSpy: jest.SpyInstance;
  let compareSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: RedisService, useValue: RedisServiceMock },
        { provide: TokenService, useValue: TokenServiceMock },
        { provide: UserRepository, useValue: UserRepositoryMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    tokenService = module.get<TokenService>(TokenService);
    userRepository = module.get<UserRepository>(UserRepository);

    hashSpy = jest.spyOn(bcrypt, 'hash');
    compareSpy = jest.spyOn(bcrypt, 'compare');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    RedisServiceMock.set.mockResolvedValue(true);

    it('should singup a user when signup credentials are valid', async () => {
      const signUpCredentials = mockSignUpRequestBody();
      const newUser = mockUser(signUpCredentials);
      const token = generateMockEncryptedString();

      hashSpy.mockResolvedValueOnce(newUser.password_hash);
      UserRepositoryMock.findFirst.mockResolvedValueOnce(null);
      UserRepositoryMock.create.mockResolvedValueOnce(newUser);
      TokenServiceMock.generateToken.mockResolvedValueOnce(token);
      TokenServiceMock.saveRefreshToken.mockResolvedValueOnce(true);

      const result = await service.signup(signUpCredentials);

      expect(userRepository.create).toHaveBeenCalledWith({
        data: {
          email: signUpCredentials.email,
          username: signUpCredentials.username,
          password_hash: newUser.password_hash,
          firstName: signUpCredentials.firstName,
          lastName: signUpCredentials.lastName,
        },
        select: {
          email: true,
          id: true,
          userType: true,
          username: true,
          firstName: true,
          lastName: true,
          active: true,
        },
      });
      expect(tokenService.generateToken).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          id: newUser.id,
          email: signUpCredentials.email,
          username: signUpCredentials.username,
          userType: newUser.userType,
        }),
        TokenType.AccessToken,
      );
      expect(tokenService.generateToken).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          id: newUser.id,
          email: signUpCredentials.email,
          username: signUpCredentials.username,
          userType: newUser.userType,
        }),
        TokenType.RefreshToken,
      );
      expect(result).toMatchObject(newUser);
    });
    it('should throw an ConflictException when user with email exist', async () => {
      const signUpCredentials = mockSignUpRequestBody();
      const existingUser = mockUser({
        ...signUpCredentials,
        username: faker.internet.username(),
      });

      UserRepositoryMock.findFirst.mockResolvedValueOnce(existingUser);

      await expect(service.signup(signUpCredentials)).rejects.toThrow(
        new ConflictException(
          `Account with email ${signUpCredentials.email}` +
            ' ' +
            'already exist',
        ),
      );
    });
    it('should throw an ConflictException when user with username exist', async () => {
      const signUpCredentials = mockSignUpRequestBody();
      const existingUser = mockUser({
        ...signUpCredentials,
        email: faker.internet.email(),
      });

      UserRepositoryMock.findFirst.mockResolvedValueOnce(existingUser);

      await expect(service.signup(signUpCredentials)).rejects.toThrow(
        new ConflictException(
          `Account with username ${signUpCredentials.username}` +
            ' ' +
            'already exist',
        ),
      );
    });
  });

  describe('signin', () => {
    it('should signin a user and return user response', async () => {
      const singinCredentials = mockSignInRequestBody();
      const currentUser = mockUser(singinCredentials);
      const token = generateMockEncryptedString();

      UserRepositoryMock.findUnique.mockResolvedValueOnce(currentUser);
      compareSpy.mockResolvedValueOnce(true);
      TokenServiceMock.generateToken.mockResolvedValueOnce(token);
      TokenServiceMock.saveRefreshToken.mockResolvedValueOnce(true);

      const result = await service.signin(singinCredentials);

      expect(result).toMatchObject(currentUser);
      expect(tokenService.generateToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: currentUser.id,
          email: singinCredentials.email,
          username: currentUser.username,
          userType: currentUser.userType,
        }),
        TokenType.AccessToken,
      );
    });
    it('should raise BadRequestException when used with email does not exist', async () => {
      const singinCredentials = mockSignInRequestBody();

      UserRepositoryMock.findUnique.mockResolvedValueOnce(null);

      await expect(service.signin(singinCredentials)).rejects.toThrow(
        new BadRequestException('Invalid credentials'),
      );
    });
    it('should raise UnauthorizedException when password is invalid', async () => {
      const singinCredentials = mockSignInRequestBody();
      const currentUser = mockUser(singinCredentials);

      UserRepositoryMock.findUnique.mockResolvedValueOnce(currentUser);
      compareSpy.mockResolvedValueOnce(false);

      await expect(service.signin(singinCredentials)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });
  });

  describe('logout', () => {
    it('should not call getTokenFromHeader when cookie has refreshToken', async () => {
      TokenServiceMock.getTokenFromHeader.mockImplementationOnce(() => true);
      TokenServiceMock.verifyToken.mockImplementationOnce(() => true);
      TokenServiceMock.removeToken.mockImplementationOnce(() => true);
      await service.logout(RequestMock as Request);
      expect(tokenService.getTokenFromHeader).toHaveBeenCalledTimes(0);
      expect(tokenService.verifyToken).toHaveBeenCalled();
      expect(tokenService.removeToken).toHaveBeenCalled();
    });
    it('should call getTokenFromHeader, verifyToken, removeToken when cookies is absent', async () => {
      const request = { ...RequestMock };
      delete request.cookies;
      TokenServiceMock.verifyToken.mockImplementationOnce(() => true);
      TokenServiceMock.removeToken.mockImplementationOnce(() => true);
      await service.logout(request as Request);
      expect(tokenService.getTokenFromHeader).toHaveBeenCalled();
      expect(tokenService.verifyToken).toHaveBeenCalled();
      expect(tokenService.removeToken).toHaveBeenCalled();
    });
  });

  describe('tokenRefresh', () => {
    it('should return a authUserInfo data', async () => {
      const newUser = mockUser();
      TokenServiceMock.verifyToken.mockReturnValueOnce(true);
      TokenServiceMock.getRefreshToken.mockReturnValueOnce(true);
      UserRepositoryMock.findUnique.mockResolvedValueOnce(newUser);
      const result = await service.tokenRefresh(RequestMock as Request);
      expect(result).toMatchObject({
        refreshToken: RequestMock.cookies.refreshToken,
      });
    });
    it('should raise an unauthorized exception when refreshToken is missing', async () => {
      const unauthorizedRequest = {
        ...RequestMock,
        headers: {
          authorization: undefined,
        },
        cookies: {
          refreshToken: undefined,
        },
      };

      TokenServiceMock.getTokenFromHeader.mockImplementationOnce(() => false);

      await expect(
        service.tokenRefresh(unauthorizedRequest as Request),
      ).rejects.toThrow(
        new UnauthorizedException(
          RESPONSE_MESSAGE.INVALID_TOKEN,
          ERROR_NAME.INVALID_TOKEN,
        ),
      );
    });
    it('should raise an unauthorized exception when current system token is missing', async () => {
      TokenServiceMock.verifyToken.mockReturnValue(true);
      TokenServiceMock.getRefreshToken.mockReturnValueOnce(false);
      await expect(
        service.tokenRefresh(RequestMock as Request),
      ).rejects.toThrow(
        new UnauthorizedException(
          RESPONSE_MESSAGE.INVALID_TOKEN,
          ERROR_NAME.INVALID_TOKEN,
        ),
      );
    });
  });
});
