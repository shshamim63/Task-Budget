import { Test, TestingModule } from '@nestjs/testing';

import { ExpenseRepository } from './expense.repository';

import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';
import { createExpensePayload } from './__mock__/expense-data.mock';
import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';
import { faker } from '@faker-js/faker/.';

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
});
