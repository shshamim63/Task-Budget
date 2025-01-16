import { Test, TestingModule } from '@nestjs/testing';

import { AssociateController } from './associates.controller';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { AssociateService } from './associates.service';
import { AssociateServiceMock } from './__mock__/associates.service.mock';

import {
  AssociateMock,
  generateUserAffiliatedTo,
} from './__mock__/associate-data.mock';
import { faker } from '@faker-js/faker/.';

describe('AssociateController', () => {
  let controller: AssociateController;
  let associateService: AssociateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssociateController],
      providers: [
        { provide: AssociateService, useValue: AssociateServiceMock },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(() => {
        canActive: jest.fn(() => true);
      })
      .overrideGuard(RolesGuard)
      .useValue(() => {
        canActive: jest.fn(() => true);
      })
      .compile();

    controller = module.get<AssociateController>(AssociateController);
    associateService = module.get<AssociateService>(AssociateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAssociate', () => {
    it('should return the associate response received from the service method', async () => {
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

      AssociateServiceMock.createAssociate.mockResolvedValueOnce(associate);

      const result = await controller.createAssociate(payload);

      expect(result).toMatchObject(associate);
      expect(associateService.createAssociate).toHaveBeenCalledWith(payload);
    });
  });

  describe('getUserAssociatedTo', () => {
    it('should return the user associated to the enterprise', async () => {
      const userId = faker.number.int({ min: 1 });
      const numOfRecords = faker.number.int({ min: 1, max: 5 });
      const userAffiliatedTo = generateUserAffiliatedTo({
        userId,
        numOfRecords,
      });
      AssociateServiceMock.userAssociatesTo.mockResolvedValueOnce(
        userAffiliatedTo,
      );
      const result = await controller.getUserAssociatedTo(userId);
      expect(associateService.userAssociatesTo).toHaveBeenCalledWith(userId);
      expect(result.length).toEqual(numOfRecords);
    });
  });
});
