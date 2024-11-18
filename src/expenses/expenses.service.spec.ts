import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { UserType } from '@prisma/client';

import { faker } from '@faker-js/faker/.';

import { ExpensesService } from './expenses.service';
import { ExpenseRepository } from './expense.repository';
import { ExpenseAuthorizationService } from './expense-authorization.service';
import { RESPONSE_MESSAGE } from '../utils/constants';

import { ExpenseRepositoryMock } from './__mock__/expense.repository.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { generateTask } from '../tasks/__mock__/task-data.mock';
import {
  mockCreateExpenseRequestBody,
  mockExpense,
} from './__mock__/expense-data.mock';
import { ExpenseAuthorizationServiceMock } from './__mock__/expenseAuthorizationService.mock';

describe('', () => {
  let service: ExpensesService;
  let expenseRepository: ExpenseRepository;
  let expenseAuthorizationService: ExpenseAuthorizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: ExpenseRepository, useValue: ExpenseRepositoryMock },
        {
          provide: ExpenseAuthorizationService,
          useValue: ExpenseAuthorizationServiceMock,
        },
      ],
    }).compile();
    service = module.get<ExpensesService>(ExpensesService);
    expenseRepository = module.get<ExpenseRepository>(ExpenseRepository);
    expenseAuthorizationService = module.get<ExpenseAuthorizationService>(
      ExpenseAuthorizationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ExpensesService', () => {
    describe('createExpense', () => {
      describe('when contribuotr has role user', () => {
        it('should create a new expense', async () => {
          const currentUser = mockUser();
          const tokenPayload = mockTokenPayload(currentUser);
          const task = generateTask();
          const createExpenseRequestBody = mockCreateExpenseRequestBody();
          const expense = mockExpense({
            taskId: task.id,
            requestBody: createExpenseRequestBody,
          });

          ExpenseAuthorizationServiceMock.canCreateExpense.mockResolvedValueOnce(
            true,
          );

          ExpenseRepositoryMock.aggregate.mockResolvedValueOnce({
            _sum: { amount: faker.number.float({ max: task.budget }) },
          });

          ExpenseAuthorizationServiceMock.isExpenseExceedingBudget.mockReturnValueOnce(
            false,
          );

          ExpenseRepositoryMock.create.mockResolvedValueOnce(expense);

          const result = await service.createExpense(
            tokenPayload,
            task,
            createExpenseRequestBody,
          );

          expect(result).toEqual(expense);
          expect(expenseRepository.aggregate).toHaveBeenCalled();
          expect(expenseRepository.create).toHaveBeenCalled();
          expect(
            expenseAuthorizationService.canCreateExpense,
          ).toHaveBeenCalled();
        });
        it('should raise ForbiddenException when is not a contributor of the task', async () => {
          const currentUser = mockUser();
          const tokenPayload = mockTokenPayload(currentUser);
          const task = generateTask();
          const createExpenseRequestBody = mockCreateExpenseRequestBody();

          ExpenseAuthorizationServiceMock.canCreateExpense.mockResolvedValueOnce(
            false,
          );
          await expect(
            service.createExpense(tokenPayload, task, createExpenseRequestBody),
          ).rejects.toThrow(
            new ForbiddenException(RESPONSE_MESSAGE.EXPENSE_PERMISSION_DENIED),
          );
        });
      });
      describe('when user is an admin', () => {
        it('should create expesne when admin is a creator', async () => {
          const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
          const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
          const task = { ...generateTask(), creatorId: currentAdminUser.id };
          const createExpenseRequestBody = mockCreateExpenseRequestBody();
          const expense = mockExpense({
            taskId: task.id,
            requestBody: createExpenseRequestBody,
          });

          ExpenseAuthorizationServiceMock.canCreateExpense.mockResolvedValueOnce(
            true,
          );

          ExpenseRepositoryMock.aggregate.mockResolvedValueOnce({
            _sum: { amount: faker.number.float({ max: task.budget }) },
          });

          ExpenseAuthorizationServiceMock.isExpenseExceedingBudget.mockReturnValueOnce(
            false,
          );

          ExpenseRepositoryMock.create.mockResolvedValueOnce(expense);

          const result = await service.createExpense(
            adminUserTokenPayload,
            task,
            createExpenseRequestBody,
          );

          expect(result).toEqual(expense);
          expect(expenseRepository.aggregate).toHaveBeenCalled();
          expect(expenseRepository.create).toHaveBeenCalled();
        });

        it('should raise ForbiddenException when not the creator of the task', async () => {
          const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
          const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
          const task = generateTask();
          const createExpenseRequestBody = mockCreateExpenseRequestBody();
          ExpenseAuthorizationServiceMock.canCreateExpense.mockResolvedValueOnce(
            false,
          );

          await expect(
            service.createExpense(
              adminUserTokenPayload,
              task,
              createExpenseRequestBody,
            ),
          ).rejects.toThrow(
            new ForbiddenException(RESPONSE_MESSAGE.EXPENSE_PERMISSION_DENIED),
          );
        });
      });
      describe('when user is super', () => {
        it('should create a new expense', async () => {
          const currentSuperUser = { ...mockUser(), userType: UserType.SUPER };
          const superUserTokenPayload = mockTokenPayload(currentSuperUser);
          const task = generateTask();
          const createExpenseRequestBody = mockCreateExpenseRequestBody();
          const expense = mockExpense({
            taskId: task.id,
            requestBody: createExpenseRequestBody,
          });

          ExpenseAuthorizationServiceMock.canCreateExpense.mockResolvedValueOnce(
            true,
          );

          ExpenseRepositoryMock.aggregate.mockResolvedValueOnce({
            _sum: { amount: faker.number.float({ max: task.budget }) },
          });

          ExpenseAuthorizationServiceMock.isExpenseExceedingBudget.mockReturnValueOnce(
            false,
          );

          ExpenseRepositoryMock.create.mockResolvedValueOnce(expense);

          const result = await service.createExpense(
            superUserTokenPayload,
            task,
            createExpenseRequestBody,
          );

          expect(result).toEqual(expense);
          expect(expenseRepository.aggregate).toHaveBeenCalled();
          expect(expenseRepository.create).toHaveBeenCalled();
        });
      });
      it('should raise BadRequestException when current amount exceeds the total budget', async () => {
        const currentUser = mockUser();
        const tokenPayload = mockTokenPayload(currentUser);
        const task = generateTask();
        const createExpenseRequestBody = mockCreateExpenseRequestBody();

        ExpenseAuthorizationServiceMock.canCreateExpense.mockResolvedValueOnce(
          true,
        );

        ExpenseRepositoryMock.aggregate.mockResolvedValueOnce({
          _sum: {
            amount: faker.number.float({
              min: task.budget,
              max: task.budget + 1000,
            }),
          },
        });

        ExpenseAuthorizationServiceMock.isExpenseExceedingBudget.mockReturnValueOnce(
          true,
        );

        await expect(
          service.createExpense(tokenPayload, task, createExpenseRequestBody),
        ).rejects.toThrow(
          new BadRequestException(RESPONSE_MESSAGE.EXPENSE_EXCEED),
        );
      });
    });
    describe('getExpense', () => {
      describe('when contributor has role user', () => {
        it('should return the expnese that matches the id', async () => {
          const currentUser = mockUser();
          const tokenPayload = mockTokenPayload(currentUser);
          const task = generateTask();
          const expense = mockExpense({
            taskId: task.id,
          });

          ExpenseAuthorizationServiceMock.canViewExpense.mockResolvedValueOnce(
            true,
          );

          ExpenseRepositoryMock.findUnique.mockResolvedValueOnce(expense);

          const result = await service.getExpense(
            tokenPayload,
            task,
            expense.id,
          );

          expect(result).toMatchObject(expense);
          expect(expenseAuthorizationService.canViewExpense).toHaveBeenCalled();
          expect(expenseRepository.findUnique).toHaveBeenCalled();
        });
        it('should raise ForbiddenException when is not a contributor of the task', async () => {
          const currentUser = mockUser();
          const tokenPayload = mockTokenPayload(currentUser);
          const task = generateTask();
          const expense = mockExpense({
            taskId: task.id,
          });

          ExpenseAuthorizationServiceMock.canViewExpense.mockResolvedValueOnce(
            false,
          );

          await expect(
            service.getExpense(tokenPayload, task, expense.id),
          ).rejects.toThrow(
            new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED),
          );
        });
      });
      describe('when user has role admin', () => {
        it('should send expesne response', async () => {
          const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
          const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
          const task = { ...generateTask(), creatorId: currentAdminUser.id };
          const expense = mockExpense({
            taskId: task.id,
          });

          ExpenseAuthorizationServiceMock.canViewExpense.mockResolvedValueOnce(
            true,
          );

          ExpenseRepositoryMock.findUnique.mockResolvedValueOnce(expense);
          const result = await service.getExpense(
            adminUserTokenPayload,
            task,
            expense.id,
          );

          expect(result).toMatchObject(expense);
          expect(expenseRepository.findUnique).toHaveBeenCalled();
        });

        it('should raise ForbiddenException when not the creator of the task', async () => {
          const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
          const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
          const task = generateTask();
          const expense = mockExpense({
            taskId: task.id,
          });

          ExpenseAuthorizationServiceMock.canViewExpense.mockResolvedValueOnce(
            false,
          );

          await expect(
            service.getExpense(adminUserTokenPayload, task, expense.id),
          ).rejects.toThrow(
            new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED),
          );
        });
      });
      describe('when user has role as super', () => {
        it('should return expense object', async () => {
          const currentSuperUser = { ...mockUser(), userType: UserType.SUPER };
          const superUserTokenPayload = mockTokenPayload(currentSuperUser);
          const task = generateTask();
          const expense = mockExpense({
            taskId: task.id,
          });

          ExpenseAuthorizationServiceMock.canViewExpense.mockResolvedValueOnce(
            true,
          );

          ExpenseRepositoryMock.findUnique.mockResolvedValueOnce(expense);
          const result = await service.getExpense(
            superUserTokenPayload,
            task,
            expense.id,
          );

          expect(result).toMatchObject(expense);
          expect(expenseRepository.findUnique).toHaveBeenCalled();
        });
      });
    });
    describe('getExpenses', () => {
      describe('when contributor has role user', () => {
        it('should return the expnese that matches the id', async () => {
          const currentUser = mockUser();
          const tokenPayload = mockTokenPayload(currentUser);
          const task = generateTask();

          const expenses = Array.from({ length: 2 }, () =>
            mockExpense({
              taskId: task.id,
            }),
          );
          ExpenseAuthorizationServiceMock.canViewExpense.mockResolvedValueOnce(
            true,
          );

          ExpenseRepositoryMock.findMany.mockResolvedValueOnce(expenses);
          const result = await service.getExpenses(tokenPayload, task);

          expect(result).toEqual(expect.arrayContaining(expenses));
          expect(expenseAuthorizationService.canViewExpense).toHaveBeenCalled();
          expect(expenseRepository.findMany).toHaveBeenCalled();
        });
        it('should raise ForbiddenException when is not a contributor of the task', async () => {
          const currentUser = mockUser();
          const tokenPayload = mockTokenPayload(currentUser);
          const task = generateTask();
          const expense = mockExpense({
            taskId: task.id,
          });

          ExpenseAuthorizationServiceMock.canViewExpense.mockResolvedValueOnce(
            false,
          );

          await expect(
            service.getExpense(tokenPayload, task, expense.id),
          ).rejects.toThrow(
            new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED),
          );
        });
      });
      describe('when user has role admin', () => {
        it('should return expesne object', async () => {
          const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
          const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
          const task = { ...generateTask(), creatorId: currentAdminUser.id };
          const expenses = Array.from({ length: 2 }, () =>
            mockExpense({
              taskId: task.id,
            }),
          );

          ExpenseAuthorizationServiceMock.canViewExpense.mockResolvedValueOnce(
            true,
          );

          ExpenseRepositoryMock.findMany.mockResolvedValueOnce(expenses);
          const result = await service.getExpenses(adminUserTokenPayload, task);

          expect(result).toEqual(expect.arrayContaining(expenses));
          expect(expenseRepository.findMany).toHaveBeenCalled();
        });

        it('should raise ForbiddenException when not the creator of the task', async () => {
          const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
          const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
          const task = generateTask();

          ExpenseAuthorizationServiceMock.canViewExpense.mockResolvedValueOnce(
            false,
          );

          await expect(
            service.getExpenses(adminUserTokenPayload, task),
          ).rejects.toThrow(
            new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED),
          );
        });
      });
      describe('when user has role as super', () => {
        it('should return expense object', async () => {
          const currentSuperUser = { ...mockUser(), userType: UserType.SUPER };
          const superUserTokenPayload = mockTokenPayload(currentSuperUser);
          const task = generateTask();
          const expenses = Array.from({ length: 2 }, () =>
            mockExpense({
              taskId: task.id,
            }),
          );

          ExpenseAuthorizationServiceMock.canViewExpense.mockResolvedValueOnce(
            true,
          );

          ExpenseRepositoryMock.findMany.mockResolvedValueOnce(expenses);

          const result = await service.getExpenses(superUserTokenPayload, task);

          expect(result).toEqual(expect.arrayContaining(expenses));
          expect(expenseRepository.findMany).toHaveBeenCalled();
        });
      });
    });
  });
});
