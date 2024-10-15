import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserType } from '@prisma/client';

import { RolesGuard } from '../../../src/auth/guards/roles.guard';

import { ERROR_NAME, RESPONSE_MESSAGE } from '../../../src/utils/constants';

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

  it('should deny access when role is defined and the user does not have the required role', async () => {
    const context = createMockExecutionContext(
      [UserType.ADMIN, UserType.SUPER],
      UserType.USER,
    );

    reflector.getAllAndOverride = jest
      .fn()
      .mockReturnValue([UserType.ADMIN, UserType.SUPER]);

    try {
      await rolesGuard.canActivate(context);
    } catch (error) {
      expect(error.status).toEqual(403);
      expect(error.response.message).toEqual(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
      );
      expect(error.response.error).toEqual(ERROR_NAME.PERMISSION_DENIED);
    }
  });

  it('should permit access when user has the required role', async () => {
    const context = createMockExecutionContext(
      [UserType.ADMIN, UserType.SUPER],
      UserType.SUPER,
    );

    reflector.getAllAndOverride = jest
      .fn()
      .mockReturnValue([UserType.ADMIN, UserType.SUPER]);

    const result = await rolesGuard.canActivate(context);
    expect(result).toBe(true);
  });
});
