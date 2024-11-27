import { Test, TestingModule } from '@nestjs/testing';
import { DesignationService } from './designations.service';
import { DesignationRepository } from './designations.repository';
import { DesignationRepositoryMock } from './__mock__/designations.repository.mock';
import { DesignationMock } from './__mock__/designation-data.mock';

describe('DesignationService', () => {
  let service: DesignationService;
  let designationRepository: DesignationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DesignationService,
        { provide: DesignationRepository, useValue: DesignationRepositoryMock },
      ],
    }).compile();

    service = module.get<DesignationService>(DesignationService);
    designationRepository = module.get<DesignationRepository>(
      DesignationRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDesignation', () => {
    it('should call the create method of the repository and return the designation object', async () => {
      const designation = DesignationMock();
      const {
        name,
        description,
        department: { id: departmentId },
      } = designation;
      const payload = { name, description, departmentId };

      DesignationRepositoryMock.create.mockResolvedValueOnce(designation);

      const result = await service.createDesignation(payload);

      expect(result.name).toEqual(name);
      expect(result.description).toEqual(description);
      expect(result.department.id).toEqual(departmentId);

      const repositorypayload = {
        name,
        description,
        department: { connect: { id: departmentId } },
      };

      const query = {
        id: true,
        name: true,
        description: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      };

      expect(designationRepository.create).toHaveBeenCalledWith({
        data: repositorypayload,
        query,
      });
    });
  });
});
