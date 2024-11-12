import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { SignInDto, SignUpDto } from './dto/auth-credentials.dto';

import {
  mockSignInRequestBody,
  mockSignUpRequestBody,
} from './__mock__/auth-data.mock';
import { AuthServiceMock } from './__mock__/auth.service.mock';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: AuthServiceMock }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully sign up a user and serialize the response', async () => {
      const signupCredentials: SignUpDto = mockSignUpRequestBody();

      const result = await authController.signup(signupCredentials);

      expect(authService.signup).toHaveBeenCalledWith(signupCredentials);
      expect(result).toMatchObject({
        id: expect.any(Number),
        email: expect.any(String),
        username: expect.any(String),
        token: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result).toMatchObject({
        email: signupCredentials.email,
        username: signupCredentials.username,
      });
    });
  });

  describe('signin', () => {
    it('should successfully login the user', async () => {
      const signinCredential: SignInDto = mockSignInRequestBody();
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
