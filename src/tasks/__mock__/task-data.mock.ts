import { faker } from '@faker-js/faker/.';
import { Prisma, TaskStatus } from '@prisma/client';
import { TaskResponseDto } from '../dto/task.dto';
import { CreateTaskDto } from '../dto/create-task.dto';
import { REDIS_KEYS_FOR_TASK } from '../../utils/redis-keys';

export const generateTaskDto = (): CreateTaskDto => {
  return {
    description: faker.lorem.sentence(),
    title: faker.lorem.words(),
    budget: faker.number.float({ min: 100, max: 400 }),
    enterpriseId: faker.number.int({ min: 1 }),
  };
};

export const generateTask = (
  taskDto: CreateTaskDto = {} as CreateTaskDto,
): TaskResponseDto => {
  const task = {
    id: faker.number.int(),
    title: taskDto.title ?? faker.lorem.words(),
    description: taskDto.description ?? faker.lorem.sentence(),
    creatorId: faker.number.int(),
    status: TaskStatus.OPEN,
    enterpriseId: taskDto.enterpriseId ?? faker.number.int({ min: 1 }),
    budget: new Prisma.Decimal(
      taskDto.budget ?? faker.number.float({ min: 100, max: 10000 }),
    ),
  };
  return new TaskResponseDto(task);
};

export const generateTasks = (numOfTasks: number = 1): TaskResponseDto[] => {
  return Array.from({ length: numOfTasks }, generateTask);
};

export const generateRedisMockKey = (id: number): string => {
  return `${REDIS_KEYS_FOR_TASK.TASK_WITH_ID}-${id}`;
};
