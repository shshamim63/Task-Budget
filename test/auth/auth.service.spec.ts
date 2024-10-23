import { Test, TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/.';

import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TokenSerive } from '../../src/token/token.service';

import { SignUpDto } from '../../src/auth/dto/auth-credentials.dto';
import {
  generateMockUser,
  generateSignUpDto,
  generateToken,
  generateUserJWTPayload,
} from '../helpers/auth.helpers';

import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
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
    it('should successfully signup a new user', async () => {
      const signUpDto: SignUpDto = generateSignUpDto();
      const hashPassword = await bcrypt.hash(signUpDto.password, saltRound);

      const mockSignUpResponse = {
        id: faker.number.int({ min: 1 }),
        email: signUpDto.email,
        username: signUpDto.username,
        password_hash: hashPassword,
      };

      const mockToken = generateToken();
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockSignUpResponse);

      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashPassword as never);
      mockTokenService.generateToken.mockReturnValue(mockToken);

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
      expect(tokenService.generateToken).toHaveBeenCalled();
      expect(result).toEqual({ ...mockSignUpResponse, token: mockToken });
    });

    it('should throw a ConflictException if the email already exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(true);
      const signUpDto = generateSignUpDto();
      await expect(authService.signup(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('signin', () => {
    it('should successfully login a user with right credentials', async () => {
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

    it('should raise an BadRequestException when user is not present', async () => {
      const signInParams: SignInParams = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(false);

      await expect(authService.signin(signInParams)).rejects.toThrow(
        BadRequestException,
      );
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

      await expect(authService.signin(signInParams)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
