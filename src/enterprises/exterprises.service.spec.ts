import { Test, TestingModule } from '@nestjs/testing';

import { EnterpriseService } from './exterprises.service';
import { EnterpriseRepository } from './enterprise.repository';

import { EnterpriseMock } from './__mock__/enterprise-data.mock';
import { EnterpriseRepositoryMock } from './__mock__/enterprise.repository.mock';

describe('EnterpriseService', () => {
  let service: EnterpriseService;
  let enterpriseRepository: EnterpriseRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseService,
        { provide: EnterpriseRepository, useValue: EnterpriseRepositoryMock },
      ],
    }).compile();

    service = module.get<EnterpriseService>(EnterpriseService);
    enterpriseRepository =
      module.get<EnterpriseRepository>(EnterpriseRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createEnterprise', () => {
    it('should call the create repository method and return the received object', async () => {
      const enterprise = EnterpriseMock();

      const requestBody = {
        name: enterprise.name,
        logo: enterprise.logo,
        registrationNumber: enterprise.registrationNumber,
        establishedAt: enterprise.establishedAt,
        phone: enterprise.phone,
        email: enterprise.email,
        website: enterprise.website,
        address: enterprise.address,
      };

      EnterpriseRepositoryMock.create.mockResolvedValueOnce(enterprise);

      const result = await service.createEnterprise(requestBody);
      expect(result).toMatchObject(requestBody);
      expect(enterpriseRepository.create).toHaveBeenCalledWith(requestBody);
    });
  });
});
