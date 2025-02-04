import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentRepository } from './departments.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';
import { faker } from '@faker-js/faker/.';

describe('DepartmentRepository', () => {
  let repository: DepartmentRepository;
  let prismaService: PrismaService;
  let asyncErrorHandlerService: AsyncErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentRepository,
        { provide: PrismaService, useValue: PrismaServiceMock },
        {
          provide: AsyncErrorHandlerService,
          useValue: AsyncErrorHandlerServiceMock,
        },
      ],
    }).compile();

    repository = module.get<DepartmentRepository>(DepartmentRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    asyncErrorHandlerService = module.get<AsyncErrorHandlerService>(
      AsyncErrorHandlerService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should call asyncErrorHandlerService and department.create method', async () => {
      PrismaServiceMock.department.create.mockResolvedValue(true);
      const data = {
        name: faker.word.noun(),
      };
      await repository.create({ data });
      expect(prismaService.department.create).toHaveBeenCalledWith({ data });
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
    });
  });
});
