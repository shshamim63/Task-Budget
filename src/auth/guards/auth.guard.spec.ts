import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { AuthGuard } from './auth.guard';
import { TokenService } from '../../token/token.service';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../../utils/constants';
import {
  generateMockEncryptedString,
  mockUser,
} from '../__mock__/auth-data.mock';

import { TokenServiceMock } from '../../token/__mock__/token.service.mock';
import { mockTokenPayload } from '../../token/__mock__/token-data.mock';
import { RedisService } from '../../redis/redis.service';
import { RedisServiceMock } from '../../redis/__mock__/redis.service.mock';
import { REDIS_KEYS_FOR_USER } from '../../utils/redis-keys';
import { UserRepository } from '../../users/user.repository';
import { UserRepositoryMock } from '../../users/__mock__/user.repository.mock';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let userRepository: UserRepository;
  let tokenService: TokenService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: UserRepository, useValue: UserRepositoryMock },
        { provide: TokenService, useValue: TokenServiceMock },
        { provide: RedisService, useValue: RedisServiceMock },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    userRepository = module.get<UserRepository>(UserRepository);
    tokenService = module.get<TokenService>(TokenService);
    redisService = module.get<RedisService>(RedisService);
  });

  const mockExecutionContext = (token?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: token ? { authorization: `Bearer ${token}` } : {},
        }),
      }),
    }) as any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException if token is missing', async () => {
    const context = mockExecutionContext();
    TokenServiceMock.getTokenFromHeader.mockReturnValueOnce(undefined);

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(
        RESPONSE_MESSAGE.MISSING_AUTH,
        ERROR_NAME.MISSING_AUTH,
      ),
    );
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    const authToken = generateMockEncryptedString();
    const context = mockExecutionContext(authToken);
    const currentUser = mockUser();
    const tokenPayload = mockTokenPayload(currentUser);

    TokenServiceMock.getTokenFromHeader.mockReturnValueOnce(authToken);
    TokenServiceMock.verifyToken.mockReturnValueOnce(tokenPayload);
    RedisServiceMock.get.mockResolvedValueOnce(null);
    UserRepositoryMock.findUnique.mockReturnValueOnce(null);

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(
        RESPONSE_MESSAGE.USER_MISSING,
        ERROR_NAME.USER_MISSING,
      ),
    );

    expect(tokenService.getTokenFromHeader).toHaveBeenCalledWith(
      context.switchToHttp().getRequest(),
    );
    expect(tokenService.verifyToken).toHaveBeenCalledWith(authToken);
    expect(redisService.get).toHaveBeenCalledWith(
      `${REDIS_KEYS_FOR_USER.AUTH_USER}:${currentUser.id}`,
    );
    expect(userRepository.findUnique).toHaveBeenCalledWith({
      where: { id: tokenPayload.id },
      select: {
        id: true,
        email: true,
        userType: true,
        username: true,
      },
    });
  });
  describe('should return true when user is authenticated', () => {
    const authToken = generateMockEncryptedString();
    const context = mockExecutionContext(authToken);
    const currentUser = mockUser();
    const tokenPayload = mockTokenPayload(currentUser);
    it('should not call repository service when redis instacne is found', async () => {
      TokenServiceMock.getTokenFromHeader.mockReturnValueOnce(authToken);
      TokenServiceMock.verifyToken.mockReturnValueOnce(tokenPayload);
      RedisServiceMock.get.mockResolvedValueOnce(JSON.stringify(currentUser));
      const result = await authGuard.canActivate(context);
      expect(tokenService.getTokenFromHeader).toHaveBeenCalled();
      expect(tokenService.verifyToken).toHaveBeenCalledWith(authToken);
      expect(redisService.get).toHaveBeenCalledWith(
        `${REDIS_KEYS_FOR_USER.AUTH_USER}:${currentUser.id}`,
      );
      expect(userRepository.findUnique).toHaveBeenCalledTimes(0);
      expect(result).toBe(true);
    });
    it('should call repository service when redis instacne is not found', async () => {
      TokenServiceMock.getTokenFromHeader.mockReturnValueOnce(authToken);
      TokenServiceMock.verifyToken.mockReturnValueOnce(tokenPayload);
      RedisServiceMock.get.mockResolvedValueOnce(null);
      UserRepositoryMock.findUnique.mockReturnValueOnce(currentUser);

      const result = await authGuard.canActivate(context);

      expect(tokenService.getTokenFromHeader).toHaveBeenCalled();
      expect(tokenService.verifyToken).toHaveBeenCalledWith(authToken);
      expect(userRepository.findUnique).toHaveBeenCalledWith({
        where: { id: tokenPayload.id },
        select: {
          id: true,
          email: true,
          userType: true,
          username: true,
        },
      });

      expect(result).toBe(true);
    });
  });
});
