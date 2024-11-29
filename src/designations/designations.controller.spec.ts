import { Test, TestingModule } from '@nestjs/testing';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { DesignationController } from './designations.controller';
import { DesignationService } from './designations.service';

import { DesignationMock } from './__mock__/designation-data.mock';
import { DesignationServiceMock } from './__mock__/designations.service.mock';

describe('DesignationController', () => {
  let controller: DesignationController;
  let designationService: DesignationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DesignationController],
      providers: [
        { provide: DesignationService, useValue: DesignationServiceMock },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActive: jest.fn(() => true),
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActive: jest.fn(() => true) })
      .compile();

    controller = module.get<DesignationController>(DesignationController);
    designationService = module.get<DesignationService>(DesignationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDesignation', () => {
    it('should call the service create method and return the designation object', async () => {
      const designation = DesignationMock();
      const {
        name,
        description,
        department: { id: departmentId },
      } = designation;
      const payload = {
        name,
        description,
        departmentId,
      };

      DesignationServiceMock.createDesignation.mockResolvedValueOnce(
        designation,
      );

      const result = await controller.createDesignation(payload);

      expect(designationService.createDesignation).toHaveBeenCalledWith(
        payload,
      );
      expect(result.name).toEqual(name);
      expect(result.description).toEqual(description);
      expect(result.department.id).toEqual(departmentId);
    });
  });
});
