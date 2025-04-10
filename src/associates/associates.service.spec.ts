import { Test, TestingModule } from '@nestjs/testing';

import { faker } from '@faker-js/faker/.';

import { AssociateService } from './associates.service';
import { AssociateRepository } from './associate.repository';
import { AssociateCacheService } from './associates.cache.service';

import { AssociateRepositoryMock } from './__mock__/associate.repository.mock';
import {
  AssociateMock,
  generateUserAffiliatedTo,
} from './__mock__/associate-data.mock';
import { AssociateCacheServiceMock } from './__mock__/associates.cache.service.mock';

describe('AssociateService', () => {
  let service: AssociateService;
  let associateRespository: AssociateRepository;
  let associateCacheService: AssociateCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociateService,
        { provide: AssociateRepository, useValue: AssociateRepositoryMock },
        { provide: AssociateCacheService, useValue: AssociateCacheServiceMock },
      ],
    }).compile();

    service = module.get<AssociateService>(AssociateService);
    associateRespository = module.get<AssociateRepository>(AssociateRepository);
    associateCacheService = module.get<AssociateCacheService>(
      AssociateCacheService,
    );
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

      const select = {
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
      expect(associateRespository.create).toHaveBeenCalledWith({
        data,
        select,
      });
    });
  });

  describe('userAssociatesTo', () => {
    it('should not call repository and cache set method when currently data is available in redis', async () => {
      const userId = faker.number.int();
      const numOfRecords = faker.number.int({ min: 1, max: 5 });

      const userAffiliateTo = generateUserAffiliatedTo({
        userId,
        numOfRecords,
      });

      AssociateCacheServiceMock.getAssociatesToFromCache.mockResolvedValueOnce(
        userAffiliateTo,
      );

      await service.userAssociatesTo(userId);

      expect(associateRespository.findMany).toHaveBeenCalledTimes(0);
      expect(
        associateCacheService.setAssociatesToFromCache,
      ).toHaveBeenCalledTimes(0);
      expect(
        associateCacheService.getAssociatesToFromCache,
      ).toHaveBeenCalledWith(userId);
    });
    it('should call repository and cache set method when currently data is unavailable in redis', async () => {
      const userId = faker.number.int();
      const numOfRecords = faker.number.int({ min: 1, max: 5 });

      const userAffiliateTo = generateUserAffiliatedTo({
        userId,
        numOfRecords,
      });

      AssociateCacheServiceMock.getAssociatesToFromCache.mockResolvedValueOnce(
        null,
      );
      AssociateRepositoryMock.findMany.mockResolvedValueOnce(userAffiliateTo);
      AssociateCacheServiceMock.setAssociatesToFromCache.mockResolvedValueOnce(
        true,
      );
      await service.userAssociatesTo(userId);

      expect(associateRespository.findMany).toHaveBeenCalled();
      expect(associateCacheService.setAssociatesToFromCache).toHaveBeenCalled();
      expect(associateCacheService.getAssociatesToFromCache).toHaveBeenCalled();
    });
  });
});
