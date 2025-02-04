import { Test, TestingModule } from '@nestjs/testing';

import { ExpenseRepository } from './expense.repository';

import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';
import {
  createExpensePayload,
  findExpenseQueryMock,
} from './__mock__/expense-data.mock';
import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';
import { faker } from '@faker-js/faker/.';
import { Prisma } from '@prisma/client';

describe('ExpenseRepository', () => {
  let repository: ExpenseRepository;
  let prismaService: PrismaService;
  let asyncErrorHandlerService: AsyncErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseRepository,
        { provide: PrismaService, useValue: PrismaServiceMock },
        {
          provide: AsyncErrorHandlerService,
          useValue: AsyncErrorHandlerServiceMock,
        },
      ],
    }).compile();

    repository = module.get<ExpenseRepository>(ExpenseRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    asyncErrorHandlerService = module.get<AsyncErrorHandlerService>(
      AsyncErrorHandlerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.expense.create callback method', async () => {
      const createArg = createExpensePayload();
      PrismaServiceMock.expense.create.mockResolvedValue(true);
      await repository.create(createArg);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.expense.create).toHaveBeenCalledWith(createArg);
    });
  });

  describe('findFirst', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.expense.findFirst callback method', async () => {
      const query = { where: { id: faker.number.int() } };
      PrismaServiceMock.expense.findFirst(true);
      await repository.findFirst(query);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.expense.findFirst).toHaveBeenCalledWith(query);
    });
  });

  describe('findUnique', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.expense.findUnique callback method', async () => {
      const query = findExpenseQueryMock();
      PrismaServiceMock.expense.findUnique(true);
      await repository.findUnique(query);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.expense.findUnique).toHaveBeenCalledWith(query);
    });
  });

  describe('findMany', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.expense.findMany callback method', async () => {
      const query = { where: { taskId: faker.number.int() } };
      PrismaServiceMock.expense.findMany(true);
      await repository.findMany(query);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.expense.findMany).toHaveBeenCalledWith(query);
    });
  });

  describe('update', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.expense.update callback method', async () => {
      const payload = {
        where: { id: faker.number.int() },
        data: { description: faker.word.noun() },
      };
      PrismaServiceMock.expense.update(true);
      await repository.update(payload);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.expense.update).toHaveBeenCalledWith(payload);
    });
  });

  describe('aggregate', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.expense.aggregate callback method', async () => {
      const query = { where: { taskId: faker.number.int() } };
      const aggregateArg = {
        _sum: { amount: true },
      };
      const payload = {
        ...query,
        ...aggregateArg,
      } as Prisma.ExpenseAggregateArgs;
      PrismaServiceMock.expense.aggregate(true);
      await repository.aggregate(payload);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.expense.aggregate).toHaveBeenCalledWith(payload);
    });
  });
});
