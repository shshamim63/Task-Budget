import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker/.';

import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

import { AssociateRepository } from './associate.repository';
import {
  AssociateMock,
  generateUserAffiliatedTo,
} from './__mock__/associate-data.mock';
import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';
import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';
import { RedisServiceMock } from '../redis/__mock__/redis.service.mock';

import { REDIS_KEYS_FOR_ASSOCIATE } from '../utils/redis-keys';

describe('AssociateRepository', () => {
  let repository: AssociateRepository;
  let redisService: RedisService;
  let prismaService: PrismaService;
  let asyncErrorHandlerService: AsyncErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociateRepository,
        { provide: PrismaService, useValue: PrismaServiceMock },
        {
          provide: RedisService,
          useValue: RedisServiceMock,
        },
        {
          provide: AsyncErrorHandlerService,
          useValue: AsyncErrorHandlerServiceMock,
        },
        ErrorHandlerService,
      ],
    }).compile();

    repository = module.get<AssociateRepository>(AssociateRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
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

  describe('findMany', () => {
    it('Never calls redisSerive get method when key is not given', async () => {
      const userId = faker.number.int();
      const numOfRecords = faker.number.int({ min: 1, max: 5 });
      const userAffiliateTo = generateUserAffiliatedTo({
        userId,
        numOfRecords,
      });
      PrismaServiceMock.associate.findMany.mockResolvedValueOnce(
        userAffiliateTo,
      );
      const userAssociateToQuery = { affiliateId: userId };

      await repository.findMany({
        query: userAssociateToQuery,
      });

      expect(redisService.get).toHaveBeenCalledTimes(0);
    });

    it('should call redisSerive get method when key is given', async () => {
      const userId = faker.number.int();
      const numOfRecords = faker.number.int({ min: 1, max: 5 });
      const { PREFIX, SUFFIX } = REDIS_KEYS_FOR_ASSOCIATE.AFFILIATE_TO;
      const redisKey = `${PREFIX}-${userId}-${SUFFIX}`;
      const userAffiliateTo = generateUserAffiliatedTo({
        userId,
        numOfRecords,
      });
      PrismaServiceMock.associate.findMany.mockResolvedValueOnce(
        userAffiliateTo,
      );
      const userAssociateToQuery = { affiliateId: userId };

      await repository.findMany({
        redisKey,
        query: userAssociateToQuery,
      });

      expect(redisService.get).toHaveBeenCalledWith(redisKey);
    });
  });
});
