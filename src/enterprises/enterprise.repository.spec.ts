import { Test, TestingModule } from '@nestjs/testing';
import { EnterpriseRepository } from './enterprise.repository';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';
import { enterpriseRequestBodyMock } from './__mock__/enterprise-data.mock';

describe('EnterpriseRepository', () => {
  let repository: EnterpriseRepository;
  let prismaService: PrismaService;
  let asyncErrorHandlerService: AsyncErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseRepository,
        { provide: PrismaService, useValue: PrismaServiceMock },
        {
          provide: AsyncErrorHandlerService,
          useValue: AsyncErrorHandlerServiceMock,
        },
      ],
    }).compile();

    repository = module.get<EnterpriseRepository>(EnterpriseRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    asyncErrorHandlerService = module.get<AsyncErrorHandlerService>(
      AsyncErrorHandlerService,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create', () => {
    it('should call the asyncErrorHandlerService.execute and enterprise.create method', async () => {
      const data = enterpriseRequestBodyMock();
      PrismaServiceMock.enterprise.create.mockResolvedValue(true);
      await repository.create(data);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.enterprise.create).toHaveBeenCalledWith({ data });
    });
  });
});
