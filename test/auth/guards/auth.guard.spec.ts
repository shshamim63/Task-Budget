import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';

import { faker } from '@faker-js/faker/.';

import { UserType } from '@prisma/client';

import { AuthGuard } from '../../../src/auth/guards/auth.guard';

import { PrismaService } from '../../../src/prisma/prisma.service';
import { TokenSerive } from '../../../src/token/token.service';

import { ERROR_NAME, RESPONSE_MESSAGE } from '../../../src/utils/constants';
import {
  generateMockUser,
  generateUserJWTPayload,
} from '../../helpers/auth.helpers';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let prismaService: PrismaService;
  let tokenService: TokenSerive;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: TokenSerive,
          useValue: {
            getTokenFromHeader: jest.fn(),
            verifyToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    prismaService = module.get<PrismaService>(PrismaService);
    tokenService = module.get<TokenSerive>(TokenSerive);
  });

  const mockExecutionContext = (token?: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: token ? { authorization: `Bearer ${token}` } : {},
        }),
      }),
    }) as any;

  it('should throw UnauthorizedExpection if token is missing', async () => {
    const context = mockExecutionContext();
    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(
        RESPONSE_MESSAGE.MISSING_AUTH,
        ERROR_NAME.MISSING_AUTH,
      ),
    );
  });

  it('should thorow UnauthorizedException when user is not found', async () => {
    const mockToken = faker.string.alphanumeric({ length: 64 });

    const mockPayload = generateUserJWTPayload(UserType.USER);

    const context = mockExecutionContext(mockToken);

    jest.spyOn(tokenService, 'getTokenFromHeader').mockReturnValue(mockToken);
    jest.spyOn(tokenService, 'verifyToken').mockReturnValue(mockPayload);
    jest.spyOn(prismaService.user, 'findUnique').mockReturnValue(null);

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException(
        RESPONSE_MESSAGE.USER_MISSING,
        ERROR_NAME.USER_MISSING,
      ),
    );

    expect(tokenService.getTokenFromHeader).toHaveBeenCalled();
    expect(tokenService.verifyToken).toHaveBeenCalledWith(mockToken);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockPayload.id },
    });
  });

  it('should return true when user is authenticated', async () => {
    const mockToken = faker.string.alphanumeric({ length: 64 });

    const mockPayload = generateUserJWTPayload(UserType.USER);

    const mockUser = await generateMockUser(mockPayload);

    const context = mockExecutionContext(mockToken);

    jest.spyOn(tokenService, 'getTokenFromHeader').mockReturnValue(mockToken);
    jest.spyOn(tokenService, 'verifyToken').mockReturnValue(mockPayload);
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

    const result = await authGuard.canActivate(context);

    expect(tokenService.getTokenFromHeader).toHaveBeenCalled();
    expect(tokenService.verifyToken).toHaveBeenCalledWith(mockToken);
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockPayload.id },
    });

    expect(result).toBe(true);
  });
});
