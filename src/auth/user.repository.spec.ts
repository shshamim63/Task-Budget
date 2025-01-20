import { Test, TestingModule } from '@nestjs/testing';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';

describe('UserRepository', () => {
  let prismaService: PrismaService;
  let asyncErrorHandlerService: AsyncErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: PrismaServiceMock },
        {
          provide: AsyncErrorHandlerService,
          useValue: AsyncErrorHandlerService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    asyncErrorHandlerService = module.get<AsyncErrorHandlerService>(
      AsyncErrorHandlerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
