import { Test, TestingModule } from '@nestjs/testing';

import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';
import { UserRepository } from './user.repository';

import { TokenServiceMock } from '../token/__mock__/token.service.mock';
import { UserRepositoryMock } from './__mock__/user.repository.mock';
import {
  generateMockEncryptedString,
  mockSignUpRequestBody,
  mockTokenPayload,
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
      expect(tokenService.generateToken).toHaveBeenCalledWith({
        id: newUser.id,
        email: signUpCredentials.email,
        username: signUpCredentials.username,
        userType: newUser.userType,
      });
      expect(result).toMatchObject(newUser);
    });
  });
});
