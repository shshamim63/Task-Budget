import { Test, TestingModule } from '@nestjs/testing';

import { Request, Response } from 'express';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { SignInDto, SignUpDto } from './dto/auth-credentials.dto';

import {
  mockAuthenticatedUser,
  mockSignInRequestBody,
  mockSignUpRequestBody,
} from './__mock__/auth-data.mock';
import {
  AuthServiceMock,
  RequestMock,
  ResponseMock,
} from './__mock__/auth.service.mock';
import { UserResponseDto } from './dto/user.dto';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '../utils/constants';

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
      const userResponse = mockAuthenticatedUser(signupCredentials);

      AuthServiceMock.signup.mockResolvedValue(userResponse);

      await authController.signup(signupCredentials, ResponseMock as Response);

      expect(authService.signup).toHaveBeenCalledWith(signupCredentials);

      expect(ResponseMock.cookie).toHaveBeenCalledWith(
        'refreshToken',
        userResponse.refreshToken,
        expect.objectContaining(REFRESH_TOKEN_COOKIE_OPTIONS),
      );
      expect(ResponseMock.status).toHaveBeenCalledWith(201);
      expect(ResponseMock.json).toHaveBeenCalledWith(userResponse);
    });
  });

  describe('signin', () => {
    it('should successfully login the user', async () => {
      const signinCredential: SignInDto = mockSignInRequestBody();
      const userResponse = mockAuthenticatedUser(signinCredential);

      AuthServiceMock.signin.mockResolvedValue(userResponse);
      await authController.signin(signinCredential, ResponseMock as Response);

      expect(ResponseMock.cookie).toHaveBeenCalledWith(
        'refreshToken',
        userResponse.refreshToken,
        expect.objectContaining(REFRESH_TOKEN_COOKIE_OPTIONS),
      );
      expect(ResponseMock.status).toHaveBeenCalledWith(200);
      expect(ResponseMock.json).toHaveBeenCalledWith(userResponse);
    });
  });

  describe('logout', () => {
    it('should invalidate the cookie and send a successfull response', async () => {
      AuthServiceMock.logout.mockResolvedValue(true);

      await authController.logout(
        RequestMock as Request,
        ResponseMock as Response,
      );

      expect(ResponseMock.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.objectContaining({ path: '/auth' }),
      );
      expect(ResponseMock.status).toHaveBeenCalledWith(200);
      expect(ResponseMock.json).toHaveBeenCalledWith({
        message: 'Logout successful',
      });
    });
  });
  describe('tokenRefresh', () => {
    it('should create a refreshtoken info instance with e a new access token', async () => {
      const signinCredential: SignInDto = mockSignInRequestBody();
      const userResponse = mockAuthenticatedUser(signinCredential);
      AuthServiceMock.tokenRefresh.mockResolvedValue(userResponse);

      await authController.refreshToken(
        RequestMock as Request,
        ResponseMock as Response,
      );

      expect(ResponseMock.cookie).toHaveBeenCalledWith(
        'refreshToken',
        userResponse.refreshToken,
        expect.objectContaining(REFRESH_TOKEN_COOKIE_OPTIONS),
      );
      expect(ResponseMock.status).toHaveBeenCalledWith(200);
      expect(ResponseMock.json).toHaveBeenCalledWith(
        new UserResponseDto(userResponse),
      );
    });
  });
});
