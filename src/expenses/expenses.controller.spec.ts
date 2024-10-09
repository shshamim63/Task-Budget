import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';
import { faker } from '@faker-js/faker/.';
import { TaskStatus, UserType } from '@prisma/client';
import { ExpenseResponseDto } from './dto/expense.dto';

describe('ExpensesController', () => {
  let expensesController: ExpensesController;
  let expensesService: ExpensesService;

  const mockExpensesService = {
    createExpense: jest.fn(),
    getExpense: jest.fn(),
    getExpenses: jest.fn(),
    updateExpense: jest.fn(),
  };

  const mockUser: JWTPayload = {
    id: faker.number.int(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    userType: UserType.USER,
    exp: faker.number.int(),
    iat: faker.number.int(),
  };

  const mockTask: TaskResponseDto = {
    id: faker.number.int(),
    title: faker.lorem.words(),
    description: faker.lorem.words(),
    creatorId: mockUser.id,
    status: TaskStatus.OPEN,
    budget: faker.number.float(),
  };

  const createExpenseDto: CreateExpenseDto = {
    description: faker.lorem.words(),
    amount: faker.number.float(),
  };

  const mockExpense: ExpenseResponseDto = {
    id: faker.number.int(),
    description: createExpenseDto.description,
    amount: createExpenseDto.amount,
    taskId: mockTask.id,
    contributor: {
      username: mockUser.username,
      email: mockUser.email,
    },
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: mockExpensesService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActive: (context: ExecutionContext) => true,
      })
      .overrideInterceptor(TaskInterceptor)
      .useValue({
        interceptor: (context: ExecutionContext, next) => next.handle(),
      })
      .compile();

    expensesController = module.get<ExpensesController>(ExpensesController);
    expensesService = module.get<ExpensesService>(ExpensesService);
  });

  describe('createExpense', () => {
    it('should call expensesService.craeteExpense with the correct parameters', async () => {
      mockExpensesService.createExpense.mockResolvedValue(mockExpense);
      const result = await expensesController.createExpense(
        createExpenseDto,
        mockUser,
        mockTask,
      );
      expect(result).toEqual(mockExpense);
      expect(expensesService.createExpense).toHaveBeenCalledWith(
        mockUser,
        mockTask,
        createExpenseDto,
      );
    });
  });

  describe('getExpense', () => {
    it('should call expensesService.getExpense with correctt parameters', async () => {
      mockExpensesService.getExpense.mockResolvedValue(mockExpense);
      const result = await expensesController.getExpense(
        mockExpense.id,
        mockUser,
        mockTask,
      );

      expect(result).toEqual(mockExpense);
      expect(expensesService.getExpense).toHaveBeenCalledWith(
        mockUser,
        mockTask,
        mockExpense.id,
      );
    });
  });
});
