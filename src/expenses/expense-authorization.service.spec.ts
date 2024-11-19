import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorRepository } from '../collaborators/collaborator.repository';
import { CollaboratorRepositoryMock } from '../collaborators/__mock__/collaborator.repository.mock';
import { ExpenseAuthorizationService } from './expense-authorization.service';
import { generateTask } from '../tasks/__mock__/task-data.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { Prisma, UserType } from '@prisma/client';
import {
  mockCreateExpenseRequestBody,
  mockExpense,
} from './__mock__/expense-data.mock';
import { faker } from '@faker-js/faker/.';
import { UpdateExpenseDto } from './dto/update-expense.dto';

describe('ExpenseAuthorizationService', () => {
  let service: ExpenseAuthorizationService;
  let collaboratorRepository: CollaboratorRepository;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseAuthorizationService,
        {
          provide: CollaboratorRepository,
          useValue: CollaboratorRepositoryMock,
        },
      ],
    }).compile();
    service = module.get<ExpenseAuthorizationService>(
      ExpenseAuthorizationService,
    );
    collaboratorRepository = module.get<CollaboratorRepository>(
      CollaboratorRepository,
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('canCreateExpense', () => {
    describe('when user has the role as USER', () => {
      it('should return true when user is a contributor', async () => {
        const currentUser = mockUser();
        const tokenPayload = mockTokenPayload(currentUser);
        const task = generateTask();
        CollaboratorRepositoryMock.findUnique.mockResolvedValueOnce(true);

        const result = await service.canCreateExpense(tokenPayload, task);
        expect(result).toBeTruthy();
        expect(collaboratorRepository.findUnique).toHaveBeenCalled();
      });
      it('should return false when user is not a contributor', async () => {
        const currentUser = mockUser();
        const tokenPayload = mockTokenPayload(currentUser);
        const task = generateTask();
        CollaboratorRepositoryMock.findUnique.mockResolvedValueOnce(null);

        const result = await service.canCreateExpense(tokenPayload, task);
        expect(result).toEqual(false);
        expect(collaboratorRepository.findUnique).toHaveBeenCalled();
      });
    });
    describe('when user has the role as ADMIN', () => {
      it('should return true when user is a creator of the task', async () => {
        const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
        const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
        const task = { ...generateTask(), creatorId: currentAdminUser.id };

        const result = await service.canCreateExpense(
          adminUserTokenPayload,
          task,
        );
        expect(result).toBeTruthy();
        expect(collaboratorRepository.findUnique).toHaveBeenCalled();
      });
      it('should return false when user is not the creator of the task', async () => {
        const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
        const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
        const task = generateTask();
        CollaboratorRepositoryMock.findUnique.mockResolvedValueOnce(null);
        const result = await service.canCreateExpense(
          adminUserTokenPayload,
          task,
        );
        expect(result).toEqual(false);
      });
    });
    describe('when user has the role as SUPER', () => {
      it('should return true', async () => {
        const currentSuperUser = { ...mockUser(), userType: UserType.SUPER };
        const superUserTokenPayload = mockTokenPayload(currentSuperUser);
        const task = generateTask();

        const result = await service.canCreateExpense(
          superUserTokenPayload,
          task,
        );
        expect(result).toBeTruthy();
      });
    });
  });
  describe('canViewExpense', () => {
    describe('when user has the role as USER', () => {
      it('should return true when user is a contributor', async () => {
        const currentUser = mockUser();
        const tokenPayload = mockTokenPayload(currentUser);
        const task = generateTask();
        CollaboratorRepositoryMock.findUnique.mockResolvedValueOnce(true);

        const result = await service.canViewExpense(tokenPayload, task);
        expect(result).toBeTruthy();
        expect(collaboratorRepository.findUnique).toHaveBeenCalled();
      });
      it('should return false when user is not a contributor', async () => {
        const currentUser = mockUser();
        const tokenPayload = mockTokenPayload(currentUser);
        const task = generateTask();
        CollaboratorRepositoryMock.findUnique.mockResolvedValueOnce(null);

        const result = await service.canViewExpense(tokenPayload, task);
        expect(result).toEqual(false);
        expect(collaboratorRepository.findUnique).toHaveBeenCalled();
      });
    });
    describe('when user has the role as ADMIN', () => {
      it('should return true when user is a creator of the task', async () => {
        const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
        const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
        const task = { ...generateTask(), creatorId: currentAdminUser.id };

        const result = await service.canViewExpense(
          adminUserTokenPayload,
          task,
        );
        expect(result).toBeTruthy();
        expect(collaboratorRepository.findUnique).toHaveBeenCalled();
      });
      it('should return false when user is not the creator of the task', async () => {
        const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
        const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
        const task = generateTask();
        CollaboratorRepositoryMock.findUnique.mockResolvedValueOnce(null);
        const result = await service.canViewExpense(
          adminUserTokenPayload,
          task,
        );
        expect(result).toEqual(false);
      });
    });
    describe('when user has the role as SUPER', () => {
      it('should return true', async () => {
        const currentSuperUser = { ...mockUser(), userType: UserType.SUPER };
        const superUserTokenPayload = mockTokenPayload(currentSuperUser);
        const task = generateTask();

        const result = await service.canViewExpense(
          superUserTokenPayload,
          task,
        );
        expect(result).toBeTruthy();
      });
    });
  });
  describe('canUpdateExpence', () => {
    describe('when user has the role as USER', () => {
      it('should return true when user is a contributor', () => {
        const currentUser = mockUser();
        const tokenPayload = mockTokenPayload(currentUser);
        const task = generateTask();
        const updateResponseDto = {
          ...mockCreateExpenseRequestBody(),
        } as UpdateExpenseDto;
        const currentExpense = mockExpense({ taskId: task.id });
        const modifiedExpense = {
          ...currentExpense,
          contributorId: currentUser.id,
          amount: new Prisma.Decimal(currentExpense.amount),
        };
        const result = service.canUpdateExpence(
          tokenPayload,
          task,
          modifiedExpense,
          updateResponseDto,
        );
        expect(result).toBeTruthy();
      });
      it('should return false when user is not a contributor', () => {
        const currentUser = mockUser();
        const tokenPayload = mockTokenPayload(currentUser);
        const task = generateTask();
        const updateResponseDto =
          mockCreateExpenseRequestBody() as UpdateExpenseDto;
        const currentExpense = mockExpense({ taskId: task.id });
        const modifiedExpense = {
          ...currentExpense,
          contributorId: faker.number.int(),
          amount: new Prisma.Decimal(currentExpense.amount),
        };
        const result = service.canUpdateExpence(
          tokenPayload,
          task,
          modifiedExpense,
          updateResponseDto,
        );
        expect(result).toEqual(false);
      });
    });
    describe('when user has the role as ADMIN', () => {
      it('should return true when user is a creator of the task', async () => {
        const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
        const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
        const task = { ...generateTask(), creatorId: currentAdminUser.id };
        const updateResponseDto =
          mockCreateExpenseRequestBody() as UpdateExpenseDto;
        const currentExpense = mockExpense({ taskId: task.id });
        const modifiedExpense = {
          ...currentExpense,
          contributorId: faker.number.int(),
          amount: new Prisma.Decimal(currentExpense.amount),
        };
        const result = await service.canUpdateExpence(
          adminUserTokenPayload,
          task,
          modifiedExpense,
          updateResponseDto,
        );
        expect(result).toBeTruthy();
      });
      it('should return false when user is not the creator of the task', async () => {
        const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
        const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
        const task = generateTask();
        const updateResponseDto =
          mockCreateExpenseRequestBody() as UpdateExpenseDto;
        const currentExpense = mockExpense({ taskId: task.id });
        const modifiedExpense = {
          ...currentExpense,
          contributorId: faker.number.int(),
          amount: new Prisma.Decimal(currentExpense.amount),
        };
        const result = await service.canUpdateExpence(
          adminUserTokenPayload,
          task,
          modifiedExpense,
          updateResponseDto,
        );
        expect(result).toEqual(false);
      });
    });
    describe('when user has the role as SUPER', () => {
      it('should return true', async () => {
        const currentSuperUser = { ...mockUser(), userType: UserType.SUPER };
        const superUserTokenPayload = mockTokenPayload(currentSuperUser);
        const task = generateTask();
        const updateResponseDto =
          mockCreateExpenseRequestBody() as UpdateExpenseDto;
        const currentExpense = mockExpense({ taskId: task.id });
        const modifiedExpense = {
          ...currentExpense,
          contributorId: faker.number.int(),
          amount: new Prisma.Decimal(currentExpense.amount),
        };
        const result = await service.canUpdateExpence(
          superUserTokenPayload,
          task,
          modifiedExpense,
          updateResponseDto,
        );
        expect(result).toBeTruthy();
      });
    });
  });
  describe('isExpenseExceedingBudget', () => {
    it('should return true when current expense and new expense exceeds task budget', () => {
      const minRange = 100;
      const maxRange = 200;
      const currentTaskBudget = faker.number.float({
        min: minRange,
        max: maxRange,
      });
      const totalExpense = new Prisma.Decimal(
        faker.number.float({
          min: 10,
          max: currentTaskBudget,
        }),
      );
      const newExpenseAmount = faker.number.float({
        min: minRange,
        max: maxRange,
      });

      const result = service.isExpenseExceedingBudget(
        currentTaskBudget,
        totalExpense,
        newExpenseAmount,
      );
      expect(result).toBe(true);
    });
    it('should return false when current expense and new expense does not exceed task budget', () => {
      const minRange = 10;
      const maxRange = 200;
      const currentTaskBudget = faker.number.float({
        min: minRange,
        max: maxRange,
      });
      const totalExpense = new Prisma.Decimal(
        faker.number.float({
          min: 10,
          max: minRange,
        }),
      );
      const newExpenseAmount = faker.number.float({
        min: minRange,
        max: minRange + 20,
      });

      const result = service.isExpenseExceedingBudget(
        currentTaskBudget,
        totalExpense,
        newExpenseAmount,
      );

      expect(result).toBe(false);
    });
  });
});
