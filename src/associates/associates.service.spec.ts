import { Test, TestingModule } from '@nestjs/testing';

import { AssociateService } from './associates.service';

import { AssociateRepository } from './associate.repository';
import { AssociateRepositoryMock } from './__mock__/associate.repository.mock';

import {
  AssociateMock,
  generateUserAffiliatedTo,
} from './__mock__/associate-data.mock';
import { faker } from '@faker-js/faker/.';
import { REDIS_KEYS_FOR_ASSOCIATE } from '../utils/redis-keys';

describe('AssociateService', () => {
  let service: AssociateService;
  let associateRespository: AssociateRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociateService,
        { provide: AssociateRepository, useValue: AssociateRepositoryMock },
      ],
    }).compile();

    service = module.get<AssociateService>(AssociateService);
    associateRespository = module.get<AssociateRepository>(AssociateRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAssociate', () => {
    it('should return the correct respnpose object when repository process the instructions', async () => {
      const associate = AssociateMock();

      const {
        department: { id: departmentId },
        designation: { id: designationId },
        enterprise: { id: enterpriseId },
        affiliate: { id: affiliateId },
      } = associate;

      const payload = {
        departmentId,
        designationId,
        enterpriseId,
        affiliateId,
      };

      AssociateRepositoryMock.create.mockResolvedValueOnce(associate);
      const result = await service.createAssociate(payload);

      expect(result).toEqual(associate);

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
      expect(associateRespository.create).toHaveBeenCalledWith({ data, query });
    });
  });

  describe('userAssociatesTo', () => {
    it('should return an array', async () => {
      const userId = faker.number.int();
      const numOfRecords = faker.number.int({ min: 1, max: 5 });
      const query = { affiliateId: userId };
      const { PREFIX, SUFFIX } = REDIS_KEYS_FOR_ASSOCIATE.AFFILIATE_TO;
      const redisKey = `${PREFIX}-${userId}-${SUFFIX}`;
      const userAffiliateTo = generateUserAffiliatedTo({
        userId,
        numOfRecords,
      });

      AssociateRepositoryMock.findMany.mockResolvedValueOnce(userAffiliateTo);
      await service.userAssociatesTo(userId);
      expect(associateRespository.findMany).toHaveBeenCalledWith({
        redisKey,
        query,
      });
    });
  });
});
