import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenSerive } from '../../token/token.service';
import { UnauthorizedException } from '@nestjs/common';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../../utils/constants';

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
});
