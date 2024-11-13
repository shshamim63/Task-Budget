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
    it('should create expense successfully', async () => {
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
  });
});
