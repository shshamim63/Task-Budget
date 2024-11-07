import { faker } from '@faker-js/faker/.';

import { UserType } from '@prisma/client';

import { JWTPayload } from '../../src/auth/interfaces/auth.interface';
import { SignUpDto } from '../../src/auth/dto/auth-credentials.dto';

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

export const generateMockUser = (payload: JWTPayload | SignUpDto) => {
  return {
    id: 'id' in payload ? payload.id : faker.number.int(),
    email: payload.email,
    username: payload.username,
    password_hash:
      'password_hash' in payload
        ? payload.password_hash
        : generateEncryptedString(72),
    userType: UserType.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const generateEncryptedString = (length = 64) =>
  faker.string.alphanumeric({ length });

export const generateAuthenticatedUser = () => {
  return {
    id: faker.number.int(),
    token: generateEncryptedString(),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
  };
};

export const generateSignUpDto = (): SignUpDto => {
  const mockPassword = faker.internet.password();
  return {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: mockPassword,
    confirmPassword: mockPassword,
  };
};
