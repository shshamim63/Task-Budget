import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';
import { ExecutionContext } from '@nestjs/common';
import { ExpensesServiceMock } from './__mock__/expenses.service.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { generateTask } from '../tasks/__mock__/task-data.mock';
import {
  mockCreateExpenseRequestBody,
  mockExpense,
  mockUpdateExpenseRequestBody,
} from './__mock__/expense-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { UpdateExpenseDto } from './dto/update-expense.dto';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: ExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [{ provide: ExpensesService, useValue: ExpensesServiceMock }],
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

    controller = module.get<ExpensesController>(ExpensesController);
    service = module.get<ExpensesService>(ExpensesService);
  });

  describe('createExpense', () => {
    it('should call expensesService.craeteExpense with the correct parameters', async () => {
      const requestBody = mockCreateExpenseRequestBody();
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const expense = mockExpense({ requestBody, taskId: task.id });

      ExpensesServiceMock.createExpense.mockResolvedValue(expense);

      const result = await controller.createExpense(
        requestBody,
        currentUserPayload,
        task,
      );

      expect(result).toEqual(expense);
      expect(service.createExpense).toHaveBeenCalledWith(
        currentUserPayload,
        task,
        requestBody,
      );
    });
  });

  describe('getExpense', () => {
    it('should call expensesService.getExpense with correct parameters', async () => {
      const requestBody = mockCreateExpenseRequestBody();
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const expense = mockExpense({ requestBody, taskId: task.id });

      ExpensesServiceMock.getExpense.mockResolvedValue(expense);
      const result = await controller.getExpense(
        expense.id,
        currentUserPayload,
        task,
      );

      expect(result).toEqual(expense);
      expect(service.getExpense).toHaveBeenCalledWith(
        currentUserPayload,
        task,
        expense.id,
      );
    });
  });

  describe('getExpenses', () => {
    it('should call expensesService.getExpense with correct parameters', async () => {
      const requestBody = mockCreateExpenseRequestBody();
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const expense = mockExpense({ requestBody, taskId: task.id });

      ExpensesServiceMock.getExpenses.mockResolvedValue([expense]);
      const result = await controller.getExpenses(currentUserPayload, task);

      expect(result).toEqual(expect.arrayContaining([expense]));
      expect(service.getExpenses).toHaveBeenCalledWith(
        currentUserPayload,
        task,
      );
    });
  });
  describe('updateExpense', () => {
    it('should call expensesService.updateExpense with correct parameters', async () => {
      const updateExpenseDto: UpdateExpenseDto = mockUpdateExpenseRequestBody();
      const requestBody = mockCreateExpenseRequestBody();
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const expense = mockExpense({ requestBody, taskId: task.id });

      const updatedExpense = { ...expense, ...updateExpenseDto };

      ExpensesServiceMock.updateExpense.mockResolvedValueOnce(updatedExpense);

      const result = await controller.updateExpense(
        expense.id,
        updateExpenseDto,
        currentUserPayload,
        task,
      );
      expect(result).toEqual(updatedExpense);
      expect(service.updateExpense).toHaveBeenCalled();
    });
  });
});
