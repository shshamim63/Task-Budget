import { faker } from '@faker-js/faker/.';
import { Prisma } from '@prisma/client';
import { UserMockQuery } from '../../auth/__mock__/auth-data.mock';

export const UpdateUserPayloadMock = () => {
  return {
    ...UserMockQuery(),
    data: {
      username: faker.internet.username(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    },
  };
};

export const CreateUserPayloadMock = () => {
  return {
    data: {
      email: faker.internet.email(),
      username: faker.internet.username(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    },
  } as Prisma.UserCreateArgs;
};

export const UpdateUserPasswordPayloadMock = () => {
  const newPassword = faker.internet.password();

  return {
    currentPassword: faker.internet.password(),
    newPassword: newPassword,
    confirmNewPassword: newPassword,
  };
};
