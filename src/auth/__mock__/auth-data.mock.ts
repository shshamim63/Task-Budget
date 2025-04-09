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
    username: username ?? faker.internet.username(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    active: faker.datatype.boolean(),
    password_hash: generateMockEncryptedString(72),
    userType: UserType.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
    companionOf: Array.from(
      { length: faker.number.int({ min: 0, max: 4 }) },
      () => ({
        id: faker.number.int({ min: 1 }),
      }),
    ),
  };
};

export const generateAuthenticatedUser = () => {
  return {
    id: faker.number.int(),
    accessToken: generateMockEncryptedString(64),
    refreshToken: generateMockEncryptedString(64),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    email: faker.internet.email(),
    username: faker.internet.username(),
  };
};

export const mockAuthenticatedUser = (data) => {
  return {
    ...mockUser(data),
    accessToken: generateMockEncryptedString(64),
    refreshToken: generateMockEncryptedString(64),
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
    username: faker.internet.username(),
    password: password,
    confirmPassword: password,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };
};

export const UserMockQuery = () => {
  return {
    where: { id: faker.number.int() },
  };
};
