import { faker } from '@faker-js/faker/.';
import { TaskStatus, UserType } from '@prisma/client';

export const generateMockCollaboratorsResponse = () => {
  return [
    {
      id: faker.number.int(),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      status: TaskStatus.OPEN,
      budget: faker.number.int(),
      creator: {
        id: faker.number.int(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        userType: UserType.ADMIN,
      },
      members: [
        {
          id: faker.number.int(),
          username: faker.internet.userName(),
          email: faker.internet.email(),
        },
      ],
    },
  ];
};

export const generateCollaboratorId = () => {
  return {
    collaboratorId: faker.number.int({ min: 1 }),
  };
};
