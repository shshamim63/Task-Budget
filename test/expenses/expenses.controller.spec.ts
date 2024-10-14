import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from '../../src/expenses/expenses.controller';
import { ExpensesService } from '../../src/expenses/expenses.service';
import { JWTPayload } from '../../src/auth/interfaces/auth.interface';
import { TaskResponseDto } from '../../src/tasks/dto/task.dto';
import { CreateExpenseDto } from '../../src/expenses/dto/create-expense.dto';
import { AuthGuard } from '../../src/auth/guards/auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { TaskInterceptor } from '../../src/tasks/interceptors/task.interceptor';
import { faker } from '@faker-js/faker/.';
import { UserType } from '@prisma/client';
import { ExpenseResponseDto } from '../../src/expenses/dto/expense.dto';
import { UpdateExpenseDto } from '../../src/expenses/dto/update-expense.dto';
import { generateTask } from '../helpers/task.helpers';
import { generateUserJWTPayload } from '../helpers/auth.helpers';

describe('ExpensesController', () => {
  let expensesController: ExpensesController;
  let expensesService: ExpensesService;

  const mockExpensesService = {
    createExpense: jest.fn(),
    getExpense: jest.fn(),
    getExpenses: jest.fn(),
    updateExpense: jest.fn(),
  };

  const mockUser: JWTPayload = generateUserJWTPayload(UserType.USER);

  const mockTask: TaskResponseDto = generateTask();

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
        canActive: jest.fn(() => true),
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
    it('should call expensesService.getExpense with correct parameters', async () => {
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

  describe('getExpenses', () => {
    it('should call expensesService.getExpense with correct parameters', async () => {
      mockExpensesService.getExpenses.mockResolvedValue([mockExpense]);
      const result = await expensesController.getExpenses(mockUser, mockTask);

      expect(result).toEqual(expect.arrayContaining([mockExpense]));
      expect(expensesService.getExpenses).toHaveBeenCalledWith(
        mockUser,
        mockTask,
      );
    });
  });
  describe('updateExpense', () => {
    it('should call expensesService.updateExpense with correct parameters', async () => {
      const updateExpenseDto: UpdateExpenseDto = {
        description: faker.lorem.words(),
        amount: faker.number.float(),
        contributorId: faker.number.int(),
      };
      mockExpensesService.updateExpense.mockResolvedValue({
        ...mockExpense,
        ...updateExpenseDto,
      });

      const result = await expensesController.updateExpense(
        mockExpense.id,
        updateExpenseDto,
        mockUser,
        mockTask,
      );
      expect(result).toEqual({
        ...mockExpense,
        ...updateExpenseDto,
      });
      expect(expensesService.updateExpense).toHaveBeenCalled();
    });
  });
});
