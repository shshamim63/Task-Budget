import { Test, TestingModule } from '@nestjs/testing';

import { faker } from '@faker-js/faker';

import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';

import { SignInDto, SignUpDto } from '../../src/auth/dto/auth-credentials.dto';
import { UserResponseDto } from '../../src/auth/dto/user.dto';
import { generateAuthenticatedUser } from '../test-seed/auth.helpers';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  const mockAuthenticatedUser = generateAuthenticatedUser();
  const mockAuthService = {
    signup: jest.fn((dto: SignUpDto) => {
      return new UserResponseDto({
        ...mockAuthenticatedUser,
        email: dto.email,
        username: dto.username,
      });
    }),
    signin: jest.fn((dto: SignInDto) => {
      return new UserResponseDto({
        ...mockAuthenticatedUser,
        email: dto.email,
        username: faker.internet.userName(),
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully sign up a user and serialize the response', async () => {
      const password = faker.internet.password();
      const signupCredentials: SignUpDto = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: password,
        confirmPassword: password,
      };

      const result = await authController.signup(signupCredentials);

      expect(authService.signup).toHaveBeenCalled();
      expect(result).toMatchObject({
        id: expect.any(Number),
        email: expect.any(String),
        username: expect.any(String),
        token: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result.email).toEqual(signupCredentials.email);
      expect(result.username).toEqual(signupCredentials.username);
    });
  });

  describe('signin', () => {
    it('should successfully login the user', async () => {
      const signinCredential: SignInDto = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      const result = await authController.signin(signinCredential);

      expect(result).toMatchObject({
        id: expect.any(Number),
        email: expect.any(String),
        username: expect.any(String),
        token: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result.email).toEqual(signinCredential.email);
    });
  });
});
