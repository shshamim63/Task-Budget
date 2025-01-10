import { faker } from '@faker-js/faker/.';
import { AUTHORIZATION_TYPE } from '../../utils/constants';
import { Request } from 'express';
import { UserType } from '@prisma/client';
import { AuthUser } from '../../auth/interfaces/auth.interface';

export const mockToken = () => faker.string.alphanumeric({ length: 64 });

export const mockRequest = (token) => {
  return {
    headers: {
      authorization: `${AUTHORIZATION_TYPE} ${token}`,
    },
  } as unknown as Request;
};

export const mockTokenPayload = (user = {} as AuthUser) => {
  const { id, email, userType, username } = user;

  return {
    id: id ?? faker.number.int({ min: 1 }),
    email: email ?? faker.internet.email(),
    username: username ?? faker.internet.userName(),
    userType: userType ?? UserType.USER,
    exp: faker.number.int(),
    iat: faker.number.int(),
  };
};
