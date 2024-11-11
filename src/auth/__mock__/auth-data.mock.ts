import { faker } from '@faker-js/faker/.';

import { UserType } from '@prisma/client';

import { SignInDto, SignUpDto } from '../dto/auth-credentials.dto';

export const generateMockEncryptedString = (length = 64) =>
  faker.string.alphanumeric({ length });

export const mockUser = (data: Partial<SignUpDto> = {}) => {
  const { email, username } = data;

  return {
    id: faker.number.int(),
    email: email ?? faker.internet.email(),
    username: username ?? faker.internet.userName(),
    password_hash: generateMockEncryptedString(72),
    userType: UserType.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const generateAuthenticatedUser = () => {
  return {
    id: faker.number.int(),
    token: generateMockEncryptedString(64),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
  };
};

export const mockAuthenticatedUser = (data) => {
  return {
    ...mockUser(data),
    token: generateMockEncryptedString(64),
  };
};

export const mockSignInRequestBody = (): SignInDto => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
};

export const mockSignUpRequestBody = (): SignUpDto => {
  const { email, password } = mockSignInRequestBody();

  return {
    email: email,
    username: faker.internet.userName(),
    password: password,
    confirmPassword: password,
  };
};
