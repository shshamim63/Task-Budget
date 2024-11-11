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
import { UserRepository } from './user.repository';

import { TokenServiceMock } from '../token/__mock__/token.service.mock';
import { UserRepositoryMock } from './__mock__/user.repository.mock';
import {
  generateMockEncryptedString,
  mockSignInRequestBody,
  mockSignUpRequestBody,
  mockUser,
} from './__mock__/auth-data.mock';

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
    it('should singup a user when signup credentials are valid', async () => {
      const signUpCredentials = mockSignUpRequestBody();
      const newUser = mockUser(signUpCredentials);
      const token = generateMockEncryptedString();

      hashSpy.mockResolvedValueOnce(newUser.password_hash);
      UserRepositoryMock.findFirst.mockResolvedValueOnce(null);
      UserRepositoryMock.create.mockResolvedValueOnce(newUser);
      TokenServiceMock.generateToken.mockResolvedValueOnce(token);

      const result = await service.signup(signUpCredentials);

      expect(userRepository.create).toHaveBeenCalledWith({
        email: signUpCredentials.email,
        username: signUpCredentials.username,
        password_hash: newUser.password_hash,
      });
      expect(tokenService.generateToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: newUser.id,
          email: signUpCredentials.email,
          username: signUpCredentials.username,
          userType: newUser.userType,
        }),
      );
      expect(result).toMatchObject(newUser);
    });
    it('should throw an ConflictException when user with email exist', async () => {
      const signUpCredentials = mockSignUpRequestBody();
      const existingUser = mockUser({
        ...signUpCredentials,
        username: faker.internet.userName(),
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

      const result = await service.signin(singinCredentials);

      expect(result).toMatchObject(currentUser);
      expect(tokenService.generateToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: currentUser.id,
          email: singinCredentials.email,
          username: currentUser.username,
          userType: currentUser.userType,
        }),
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
});
