import { faker } from '@faker-js/faker/.';
import { TaskStatus, UserType } from '@prisma/client';

export const generateCollaboratorId = () => {
  return {
    collaboratorId: faker.number.int({ min: 1 }),
  };
};

export const generateCollaboratorList = (numOfCollaborators) => {
  return faker.helpers.uniqueArray(
    () => ({ id: faker.number.int({ min: 1 }) }),
    numOfCollaborators,
  );
};

const generateMember = () => {
  return {
    id: faker.number.int({ min: 1 }),
    username: faker.internet.username(),
    email: faker.internet.email(),
  };
};

export const generateTaskWithCollaboratorData = (numOfMembers, task) => {
  return {
    id: task.id,
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status: TaskStatus.OPEN,
    budget: faker.number.float({ min: 100, max: 400 }),
    creator: {
      id: task.creatorId,
      username: faker.internet.username(),
      email: faker.internet.email(),
      userType: UserType.ADMIN,
    },
    members: Array.from({ length: numOfMembers }, generateMember),
  };
};
