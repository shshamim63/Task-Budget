import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentService } from './departments.service';
import { DepartmentRepository } from './departments.repository';
import { DepartmentRepositoryMock } from './__mock__/departments.repository.mock';
import { DepartmentMock } from './__mock__/department-data.mock';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let departmentRepository: DepartmentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        { provide: DepartmentRepository, useValue: DepartmentRepositoryMock },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
    departmentRepository =
      module.get<DepartmentRepository>(DepartmentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDepartment', () => {
    it('should call the create method of department repository and return the Appropriate response', async () => {
      const department = DepartmentMock();
      const payload = { name: department.name };
      DepartmentRepositoryMock.create.mockResolvedValueOnce(department);
      const result = await service.createDepartment(payload);
      expect(departmentRepository.create).toHaveBeenCalledWith({
        data: payload,
      });
      expect(result).toMatchObject(department);
    });
  });
});
