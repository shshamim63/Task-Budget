import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { ExpenseRepository } from './expense.repository';
import { ExpenseRepositoryMock } from './__mock__/expense.repository.mock';
import { CollaboratorRepository } from '../collaborators/collaborator.repository';
import { CollaboratorRepositoryMock } from '../collaborators/__mock__/collaborator.repository.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { generateTask } from '../tasks/__mock__/task-data.mock';
import {
  mockCreateExpenseRequestBody,
  mockExpense,
} from './__mock__/expense-data.mock';
import { faker } from '@faker-js/faker/.';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { RESPONSE_MESSAGE } from '../utils/constants';
import { UserType } from '@prisma/client';

describe('', () => {
  let service: ExpensesService;
  let expenseRepository: ExpenseRepository;
  let collaboratorRepository: CollaboratorRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: ExpenseRepository, useValue: ExpenseRepositoryMock },
        {
          provide: CollaboratorRepository,
          useValue: CollaboratorRepositoryMock,
        },
      ],
    }).compile();
    service = module.get<ExpensesService>(ExpensesService);
    expenseRepository = module.get<ExpenseRepository>(ExpenseRepository);
    collaboratorRepository = module.get<CollaboratorRepository>(
      CollaboratorRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createExpense', () => {
    describe('should create expense successfully', () => {
      it('when user is a contributor', async () => {
        const currentUser = mockUser();
        const tokenPayload = mockTokenPayload(currentUser);
        const task = generateTask();
        const createExpenseRequestBody = mockCreateExpenseRequestBody();
        const expense = mockExpense({
          taskId: task.id,
          requestBody: createExpenseRequestBody,
        });

        CollaboratorRepositoryMock.findUnique.mockResolvedValueOnce(
          currentUser,
        );
        ExpenseRepositoryMock.aggregate.mockResolvedValueOnce({
          _sum: { amount: faker.number.float({ max: task.budget }) },
        });
        ExpenseRepositoryMock.create.mockResolvedValueOnce(expense);

        const result = await service.createExpense(
          tokenPayload,
          task,
          createExpenseRequestBody,
        );

        expect(result).toEqual(expense);
        expect(expenseRepository.aggregate).toHaveBeenCalled();
        expect(expenseRepository.create).toHaveBeenCalled();
        expect(collaboratorRepository.findUnique).toHaveBeenCalled();
      });

      describe('when user is a admin', () => {
        it('should create expesne when admin is a creator', async () => {
          const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
          const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
          const task = { ...generateTask(), creatorId: currentAdminUser.id };
          const createExpenseRequestBody = mockCreateExpenseRequestBody();
          const expense = mockExpense({
            taskId: task.id,
            requestBody: createExpenseRequestBody,
          });

          ExpenseRepositoryMock.aggregate.mockResolvedValueOnce({
            _sum: { amount: faker.number.float({ max: task.budget }) },
          });
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
        it('should raise ForbiddenException when admin is not the creator of the task', async () => {
          const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
          const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
          const task = generateTask();
          const createExpenseRequestBody = mockCreateExpenseRequestBody();

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
      it('when user is a Super', async () => {
        const currentSuperUser = { ...mockUser(), userType: UserType.SUPER };
        const superUserTokenPayload = mockTokenPayload(currentSuperUser);
        const task = generateTask();
        const createExpenseRequestBody = mockCreateExpenseRequestBody();
        const expense = mockExpense({
          taskId: task.id,
          requestBody: createExpenseRequestBody,
        });

        ExpenseRepositoryMock.aggregate.mockResolvedValueOnce({
          _sum: { amount: faker.number.float({ max: task.budget }) },
        });
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

    it('should raise ForbiddenException when user is not a contributor of the task', async () => {
      const currentUser = mockUser();
      const tokenPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const createExpenseRequestBody = mockCreateExpenseRequestBody();

      CollaboratorRepositoryMock.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.createExpense(tokenPayload, task, createExpenseRequestBody),
      ).rejects.toThrow(
        new ForbiddenException(RESPONSE_MESSAGE.EXPENSE_PERMISSION_DENIED),
      );
    });

    it('should raise BadRequestException when current amount exceeds the total budget', async () => {
      const currentUser = mockUser();
      const tokenPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const createExpenseRequestBody = mockCreateExpenseRequestBody();
      const expense = mockExpense({
        taskId: task.id,
        requestBody: createExpenseRequestBody,
      });

      CollaboratorRepositoryMock.findUnique.mockResolvedValueOnce(currentUser);
      ExpenseRepositoryMock.aggregate.mockResolvedValueOnce({
        _sum: {
          amount: faker.number.float({
            min: task.budget,
            max: task.budget + 1000,
          }),
        },
      });
      ExpenseRepositoryMock.create.mockResolvedValueOnce(expense);

      await expect(
        service.createExpense(tokenPayload, task, createExpenseRequestBody),
      ).rejects.toThrow(
        new BadRequestException(RESPONSE_MESSAGE.EXPENSE_EXCEED),
      );
    });
  });
});
