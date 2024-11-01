import 'reflect-metadata';
import { ROLES_KEY } from '../../src/utils/constants';
import { Roles } from '../../src/decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { Reflector } from '@nestjs/core';

describe('Roles Decorator', () => {
  it('should set roles metadata on a method', () => {
    const reflector = new Reflector();

    class MockClass {
      @Roles(UserType.ADMIN, UserType.SUPER)
      testMethod() {}
    }

    const metadata = reflector.get<UserType[]>(
      ROLES_KEY,
      MockClass.prototype.testMethod,
    );

    expect(metadata).toEqual([UserType.ADMIN, UserType.SUPER]);
  });
});
