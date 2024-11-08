import { faker } from '@faker-js/faker/.';
import { UserType } from '@prisma/client';
import { AUTHORIZATION_TYPE } from '../../utils/constants';
import { Request } from 'express';

export const mockToken = () => faker.string.alphanumeric({ length: 64 });

export const mockTokenPayload = () => {
  return {
    id: faker.number.int({ min: 1 }),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    userType: UserType.USER,
    exp: faker.number.int(),
    iat: faker.number.int(),
  };
};

export const mockRequest = (token) => {
  return {
    headers: {
      authorization: `${AUTHORIZATION_TYPE} ${token}`,
    },
  } as unknown as Request;
};
