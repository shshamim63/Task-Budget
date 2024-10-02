import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';

function createMockExecutionContext(
  roles?: UserType[],
  userType?: string,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () =>
        roles
          ? {
              user: { userType: userType || null },
            }
          : undefined,
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();
    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should allow access when no roles are defined', async () => {
    const context = createMockExecutionContext(undefined);
    reflector.getAllAndOverride = jest.fn().mockReturnValue(undefined);

    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(true);
  });
});
