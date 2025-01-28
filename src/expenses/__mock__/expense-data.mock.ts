import { faker } from '@faker-js/faker/.';
import { ExpenseResponseDto } from '../dto/expense.dto';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { JWTPayload } from '../../auth/interfaces/auth.interface';
import { UpdateExpenseDto } from '../dto/update-expense.dto';

export const mockCreateExpenseRequestBody = (): CreateExpenseDto => {
  return {
    description: faker.lorem.words(),
    amount: faker.number.float(),
  };
};

export const mockUpdateExpenseRequestBody = (): UpdateExpenseDto => {
  return {
    ...mockCreateExpenseRequestBody(),
    contributorId: faker.number.int(),
  };
};

export const mockExpense = ({
  taskId = faker.number.int({ min: 1 }),
  requestBody = {} as CreateExpenseDto,
  creator = {} as JWTPayload,
}: {
  taskId?: number;
  requestBody?: CreateExpenseDto;
  creator?: JWTPayload;
} = {}): ExpenseResponseDto => {
  return {
    id: faker.number.int(),
    description: requestBody.description ?? faker.lorem.words(),
    amount: requestBody.amount ?? faker.number.float(),
    taskId: taskId,
    contributor: {
      username: creator.username ?? faker.internet.userName(),
      email: creator.email ?? faker.internet.email(),
    },
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
  };
};

export const createExpensePayload = () => {
  const data = {
    description: faker.lorem.sentence(),
    amount: faker.number.int(),
    taskId: faker.number.int(),
    contributorId: faker.number.int(),
  };

  return {
    data,
    select: {
      id: true,
      description: true,
      amount: true,
      createdAt: true,
      updatedAt: true,
      contributor: {
        select: {
          username: true,
          email: true,
        },
      },
    },
  };
};
