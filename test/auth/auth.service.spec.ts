import { Test, TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/.';

import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TokenSerive } from '../../src/token/token.service';

import { SignUpDto } from '../../src/auth/dto/auth-credentials.dto';
import { generateSignUpDto, generateToken } from '../helpers/auth.helpers';
import { UserResponseDto } from '../../src/auth/dto/user.dto';
import { ConflictException } from '@nestjs/common';

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

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: signUpDto.email,
          username: signUpDto.username,
          password_hash: hashPassword,
        },
      });
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
});
