import { Test, TestingModule } from '@nestjs/testing';
import { EnterpriseController } from './enterprises.controller';
import { EnterpriseService } from './exterprises.service';
import { EnterpriseServiceMock } from './__mock__/enterprises.service.mock';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  EnterpriseMock,
  enterpriseRequestBodyMock,
} from './__mock__/enterprise-data.mock';

describe('EnterpriseController', () => {
  let controller: EnterpriseController;
  let service: EnterpriseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnterpriseController],
      providers: [
        { provide: EnterpriseService, useValue: EnterpriseServiceMock },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canAnctive: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canAnctive: jest.fn(() => true) })
      .compile();

    controller = module.get<EnterpriseController>(EnterpriseController);
    service = module.get<EnterpriseService>(EnterpriseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEnterprise', () => {
    it('should call the createEnterprise service method and return the received object', async () => {
      const requestBody = enterpriseRequestBodyMock();
      const enterprise = EnterpriseMock({ payload: requestBody });

      EnterpriseServiceMock.createEnterprise.mockResolvedValueOnce(enterprise);

      const result = await controller.createEnterprise(requestBody);
      expect(result).toMatchObject(requestBody);
      expect(service.createEnterprise).toHaveBeenCalledWith(requestBody);
    });
  });
});
