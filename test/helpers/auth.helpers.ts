import { faker } from '@faker-js/faker/.';

import * as bcrypt from 'bcrypt';

import { UserType } from '@prisma/client';

import { JWTPayload } from '../../src/auth/interfaces/auth.interface';

const saltRound = Number(process.env.SALTROUND);

export const generateUserJWTPayload = (type: UserType): JWTPayload => {
  return {
    id: faker.number.int(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    userType: type,
    exp: faker.number.int(),
    iat: faker.number.int(),
  };
};

export const generateMockUser = async (payload: JWTPayload) => {
  return {
    id: payload.id,
    email: payload.email,
    username: payload.username,
    password_hash: await bcrypt.hash(faker.internet.password(), saltRound),
    userType: UserType.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const generateToken = () => faker.string.alphanumeric({ length: 64 });

export const generateAuthenticatedUser = () => {
  return {
    id: faker.number.int(),
    token: generateToken(),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
  };
};

export const generateSignUpDto = () => {
  const mockPassword = faker.internet.password();
  return {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: mockPassword,
    confirmPassword: mockPassword,
  };
};
