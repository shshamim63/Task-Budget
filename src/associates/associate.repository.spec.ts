import { Test, TestingModule } from '@nestjs/testing';

import { AssociateRepository } from './associate.repository';
import { AssociateMock } from './__mock__/associate-data.mock';

import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';

import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';

import { ErrorHandlerService } from '../helpers/error.helper.service';

describe('AssociateRepository', () => {
  let repository: AssociateRepository;
  let prismaService: PrismaService;
  let asyncErrorHandlerService: AsyncErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociateRepository,
        { provide: PrismaService, useValue: PrismaServiceMock },
        {
          provide: AsyncErrorHandlerService,
          useValue: AsyncErrorHandlerServiceMock,
        },
        ErrorHandlerService,
      ],
    }).compile();

    repository = module.get<AssociateRepository>(AssociateRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    asyncErrorHandlerService = module.get<AsyncErrorHandlerService>(
      AsyncErrorHandlerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const associate = AssociateMock();

    const {
      department: { id: departmentId },
      designation: { id: designationId },
      enterprise: { id: enterpriseId },
      affiliate: { id: affiliateId },
    } = associate;

    const query = {
      id: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      designation: {
        select: {
          id: true,
          name: true,
        },
      },
      enterprise: {
        select: {
          id: true,
          name: true,
        },
      },
      affiliate: {
        select: {
          id: true,
          email: true,
        },
      },
    };

    const data = {
      department: { connect: { id: departmentId } },
      designation: { connect: { id: designationId } },
      enterprise: { connect: { id: enterpriseId } },
      affiliate: { connect: { id: affiliateId } },
    };

    it('should call prismaService.associate.create with correct parameters', async () => {
      PrismaServiceMock.associate.create.mockResolvedValueOnce(associate);
      const result = await repository.create({ data, query });
      expect(result).toEqual(associate);
      expect(prismaService.associate.create).toHaveBeenCalledWith({
        data,
        ...{ select: query },
      });
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
    });

    it('should call prismaService.associate.create with data only', async () => {
      PrismaServiceMock.associate.create.mockResolvedValueOnce(associate);

      const result = await repository.create({ data });

      expect(result).toEqual(associate);
      expect(prismaService.associate.create).toHaveBeenCalledWith({
        data,
      });
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
    });
  });
});
