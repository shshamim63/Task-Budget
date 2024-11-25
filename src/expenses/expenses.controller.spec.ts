import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expenses.service';
import { ExpenseController } from './expenses.controller';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';
import { ExecutionContext } from '@nestjs/common';
import { ExpenseServiceMock } from './__mock__/expenses.service.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { generateTask } from '../tasks/__mock__/task-data.mock';
import {
  mockCreateExpenseRequestBody,
  mockExpense,
  mockUpdateExpenseRequestBody,
} from './__mock__/expense-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { UpdateExpenseDto } from './dto/update-expense.dto';

describe('ExpenseController', () => {
  let controller: ExpenseController;
  let service: ExpenseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpenseController],
      providers: [{ provide: ExpenseService, useValue: ExpenseServiceMock }],
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

    controller = module.get<ExpenseController>(ExpenseController);
    service = module.get<ExpenseService>(ExpenseService);
  });

  describe('createExpense', () => {
    it('should call ExpenseService.craeteExpense with the correct parameters', async () => {
      const requestBody = mockCreateExpenseRequestBody();
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const expense = mockExpense({ requestBody, taskId: task.id });

      ExpenseServiceMock.createExpense.mockResolvedValue(expense);

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
    it('should call ExpenseService.getExpense with correct parameters', async () => {
      const requestBody = mockCreateExpenseRequestBody();
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const expense = mockExpense({ requestBody, taskId: task.id });

      ExpenseServiceMock.getExpense.mockResolvedValue(expense);
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
    it('should call ExpenseService.getExpense with correct parameters', async () => {
      const requestBody = mockCreateExpenseRequestBody();
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const expense = mockExpense({ requestBody, taskId: task.id });

      ExpenseServiceMock.getExpenses.mockResolvedValue([expense]);
      const result = await controller.getExpenses(currentUserPayload, task);

      expect(result).toEqual(expect.arrayContaining([expense]));
      expect(service.getExpenses).toHaveBeenCalledWith(
        currentUserPayload,
        task,
      );
    });
  });
  describe('updateExpense', () => {
    it('should call ExpenseService.updateExpense with correct parameters', async () => {
      const updateExpenseDto: UpdateExpenseDto = mockUpdateExpenseRequestBody();
      const requestBody = mockCreateExpenseRequestBody();
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const expense = mockExpense({ requestBody, taskId: task.id });

      const updatedExpense = { ...expense, ...updateExpenseDto };

      ExpenseServiceMock.updateExpense.mockResolvedValueOnce(updatedExpense);

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
