import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentController } from './departments.controller';
import { DepartmentMock } from './__mock__/department-data.mock';
import { DepartmentService } from './departments.service';
import { DepartmentServiceMock } from './__mock__/departments.service.mock';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

describe('DepartmentController', () => {
  let controller: DepartmentController;
  let deparmentService: DepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [
        { provide: DepartmentService, useValue: DepartmentServiceMock },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActive: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActive: jest.fn(() => true) })
      .compile();

    controller = module.get<DepartmentController>(DepartmentController);
    deparmentService = module.get<DepartmentService>(DepartmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDepartment', () => {
    it('should create Department successfully and interact with the service', async () => {
      const department = DepartmentMock();
      const payload = { name: department.name };
      await controller.createDepartment(payload);
      DepartmentServiceMock.createDepartment.mockResolvedValueOnce(department);
      expect(deparmentService.createDepartment).toHaveBeenCalledWith(payload);
    });
  });
});
