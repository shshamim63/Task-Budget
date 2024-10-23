import { Test, TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/.';

import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TokenSerive } from '../../src/token/token.service';

import {
  generateMockUser,
  generateSignUpDto,
  generateToken,
  generateUserJWTPayload,
} from '../helpers/auth.helpers';

import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { SignInParams } from '../../src/auth/interfaces/auth.interface';
import { UserType } from '@prisma/client';

const mockPrismaService = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockTokenService = {
  generateToken: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let tokenService: TokenSerive;
  const saltRound = Number(process.env.SALTROUND);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TokenSerive,
          useValue: mockTokenService,
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    tokenService = module.get<TokenSerive>(TokenSerive);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully signup a new user when email and username are valid', async () => {
      const signUpDto = generateSignUpDto();
      const hashPassword = await bcrypt.hash(signUpDto.password, saltRound);

      const mockSignUpResponse = {
        id: faker.number.int({ min: 1 }),
        email: signUpDto.email,
        username: signUpDto.username,
        password_hash: hashPassword,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockSignUpResponse);
      mockTokenService.generateToken.mockReturnValue(generateToken());
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashPassword as never);

      const result = await authService.signup(signUpDto);

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: signUpDto.email }, { username: signUpDto.username }],
        },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: signUpDto.email,
          username: signUpDto.username,
          password_hash: hashPassword,
        },
      });
      expect(result).toEqual({
        ...mockSignUpResponse,
        token: expect.any(String),
      });
    });

    it('should throw a ConflictException if the email already exists', async () => {
      const signUpDto = generateSignUpDto();

      const existingUser = {
        email: signUpDto.email,
        username: 'different_username',
      };
      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      await expect(authService.signup(signUpDto)).rejects.toThrow(
        new ConflictException(
          `Account with email ${signUpDto.email} already exist`,
        ),
      );

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
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
      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      await expect(authService.signup(signUpDto)).rejects.toThrow(
        new ConflictException(
          `Account with username ${signUpDto.username} already exist`,
        ),
      );

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: signUpDto.email }, { username: signUpDto.username }],
        },
      });
    });

    it('should cover the findFirst call and ensure findFirst is called even if user does not exist', async () => {
      const signUpDto = generateSignUpDto();

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await authService.signup(signUpDto);

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
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

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.signin(signInParams);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
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

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Expect an UnauthorizedException to be thrown
      await expect(authService.signin(signInParams)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInParams.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInParams.password,
        mockUser.password_hash,
      );
    });
  });

  describe('generateTokenPayload', () => {
    it('should return a valid token payload for a user', async () => {
      const mockPayload = generateUserJWTPayload(UserType.USER);
      const mockUser = await generateMockUser(mockPayload);

      const payload = authService['generateTokenPayload'](mockUser);

      expect(payload).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        userType: mockUser.userType,
      });
    });
  });
});
