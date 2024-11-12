import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { AuthGuard } from './auth.guard';
import { TokenService } from '../../token/token.service';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../../utils/constants';
import {
  generateMockEncryptedString,
  mockUser,
} from '../__mock__/auth-data.mock';
import { UserRepository } from '../user.repository';
import { UserRepositoryMock } from '../__mock__/user.repository.mock';
import { TokenServiceMock } from '../../token/__mock__/token.service.mock';
import { mockTokenPayload } from '../../token/__mock__/token-data.mock';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let userRepository: UserRepository;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: UserRepository, useValue: UserRepositoryMock },
        { provide: TokenService, useValue: TokenServiceMock },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    userRepository = module.get<UserRepository>(UserRepository);
    tokenService = module.get<TokenService>(TokenService);
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
    expect(userRepository.findUnique).toHaveBeenCalledWith({
      where: { id: tokenPayload.id },
    });
  });

  it('should return true when user is authenticated', async () => {
    const authToken = generateMockEncryptedString();
    const context = mockExecutionContext(authToken);
    const currentUser = mockUser();
    const tokenPayload = mockTokenPayload(currentUser);

    TokenServiceMock.getTokenFromHeader.mockReturnValueOnce(authToken);
    TokenServiceMock.verifyToken.mockReturnValueOnce(tokenPayload);
    UserRepositoryMock.findUnique.mockReturnValueOnce(currentUser);

    const result = await authGuard.canActivate(context);

    expect(tokenService.getTokenFromHeader).toHaveBeenCalled();
    expect(tokenService.verifyToken).toHaveBeenCalledWith(authToken);
    expect(userRepository.findUnique).toHaveBeenCalledWith({
      where: { id: tokenPayload.id },
    });

    expect(result).toBe(true);
  });
});
