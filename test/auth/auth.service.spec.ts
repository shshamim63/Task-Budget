import { Test, TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/.';

import { AuthService } from '../../src/auth/auth.service';
import { TokenSerive } from '../../src/token/token.service';

import {
  generateEncryptedString,
  generateMockUser,
  generateSignUpDto,
  generateUserJWTPayload,
} from '../mock-data/auth.mock';

import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { SignInParams } from '../../src/auth/interfaces/auth.interface';
import { UserType } from '@prisma/client';
import { UserRepository } from '../../src/auth/repositories/user.repository';

const mockUserRepository = {
  findFirst: jest.fn(),
  create: jest.fn(),
  findUnique: jest.fn(),
};

const mockTokenService = {
  generateToken: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let tokenService: TokenSerive;
  let userRepository: UserRepository;
  let bcrytpHashSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: TokenSerive,
          useValue: mockTokenService,
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    tokenService = module.get<TokenSerive>(TokenSerive);
    bcrytpHashSpy = jest.spyOn(bcrypt, 'hash');
  });

  afterEach(() => {
    jest.clearAllMocks();
    bcrytpHashSpy.mockClear();
  });

  describe('signup', () => {
    it('should successfully signup a new user when email and username are valid', async () => {
      const signUpDto = generateSignUpDto();
      const mockUser = generateMockUser(signUpDto);
      const mockToken = generateEncryptedString(64);
      bcrytpHashSpy.mockReturnValue(mockUser.password_hash);

      mockUserRepository.findFirst.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockTokenService.generateToken.mockReturnValue(mockToken);

      const result = await authService.signup(signUpDto);

      expect(mockUserRepository.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: signUpDto.email }, { username: signUpDto.username }],
        },
      });
      const mockTokenPayload = {
        email: signUpDto.email,
        id: mockUser.id,
        username: signUpDto.username,
        userType: mockUser.userType,
      };
      expect(tokenService.generateToken).toHaveBeenCalledWith(mockTokenPayload);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        data: {
          email: signUpDto.email,
          username: signUpDto.username,
          password_hash: mockUser.password_hash,
        },
      });
      expect(result).toMatchObject({
        ...mockTokenPayload,
        token: mockToken,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw a ConflictException if the email already exists', async () => {
      const signUpDto = generateSignUpDto();

      const existingUser = {
        email: signUpDto.email,
        username: 'different_username',
      };
      mockUserRepository.findFirst.mockResolvedValue(existingUser);

      await expect(authService.signup(signUpDto)).rejects.toThrow(
        new ConflictException(
          `Account with email ${signUpDto.email} already exist`,
        ),
      );

      expect(userRepository.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: signUpDto.email }, { username: signUpDto.username }],
        },
      });
    });

    it('should throw a ConflictException if the username already exists', async () => {
      const signUpDto = generateSignUpDto();

      const existingUser = {
        email: 'different_email@test.com',
        username: signUpDto.username,
      };
      mockUserRepository.findFirst.mockResolvedValue(existingUser);

      await expect(authService.signup(signUpDto)).rejects.toThrow(
        new ConflictException(
          `Account with username ${signUpDto.username} already exist`,
        ),
      );

      expect(userRepository.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: signUpDto.email }, { username: signUpDto.username }],
        },
      });
    });

    it('should cover the findFirst call and ensure findFirst is called even if user does not exist', async () => {
      const signUpDto = generateSignUpDto();

      mockUserRepository.findFirst.mockResolvedValue(null);

      const result = await authService.signup(signUpDto);

      expect(userRepository.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: signUpDto.email }, { username: signUpDto.username }],
        },
      });
      expect(result).toBeDefined();
    });
  });

  describe('signin', () => {
    it('should successfully login a user with correct credentials', async () => {
      const signInParams: SignInParams = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const mockUserJWTPayload = generateUserJWTPayload(UserType.USER);
      const mockUser = await generateMockUser(mockUserJWTPayload);

      mockUserRepository.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.signin(signInParams);

      expect(userRepository.findUnique).toHaveBeenCalledWith({
        where: { email: signInParams.email },
      });

      expect(result).toMatchObject({
        id: expect.any(Number),
        email: expect.any(String),
        username: expect.any(String),
        password_hash: expect.any(String),
        userType: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        token: expect.any(String),
      });
    });

    it('should raise an UnauthorizedException when password is invalid', async () => {
      const signInParams: SignInParams = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const mockUserJWTPayload = generateUserJWTPayload(UserType.USER);
      const mockUser = await generateMockUser(mockUserJWTPayload);

      mockUserRepository.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.signin(signInParams)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(userRepository.findUnique).toHaveBeenCalledWith({
        where: { email: signInParams.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInParams.password,
        mockUser.password_hash,
      );
    });
  });
});
