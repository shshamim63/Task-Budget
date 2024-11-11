import 'reflect-metadata';
import { Reflector } from '@nestjs/core';

import { UserType } from '@prisma/client';

import { ROLES_KEY } from '../utils/constants';
import { Roles } from './roles.decorator';

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
