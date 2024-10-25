import { faker } from '@faker-js/faker/.';
import { Prisma, TaskStatus } from '@prisma/client';
import { TaskResponseDto } from '../../src/tasks/dto/task.dto';

export const generateTask = (): TaskResponseDto => {
  return {
    id: faker.number.int(),
    title: faker.lorem.words(),
    description: faker.lorem.sentence(),
    creatorId: faker.number.int(),
    status: TaskStatus.OPEN,
    budget: new Prisma.Decimal(
      faker.number.float({ min: 100, max: 10000 }),
    ) as unknown as number,
  };
};

export const generateTasks = (numOfTasks: number = 1): TaskResponseDto[] => {
  return Array.from({ length: numOfTasks }, generateTask);
};
