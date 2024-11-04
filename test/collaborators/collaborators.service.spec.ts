import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorsService } from '../../src/collaborators/collaborators.service';
import { TaskPermissionService } from '../../src/helpers/task-permission.helper.service';
import { CollaboratorRepository } from '../../src/collaborators/repositories/collaborator.repository';
import { generateUserJWTPayload } from '../mock-data/auth.mock';
import { UserType } from '@prisma/client';
import { generateTask } from '../mock-data/task.mock';
import { TaskRepository } from '../../src/tasks/repositories/task.repository';
import { UserRepository } from '../../src/auth/repository/user.repository';
import { generateTaskWithCollaboratorData } from '../mock-data/collaborator.mock';

describe('CollaboratorsService', () => {
  let collaboratorsService: CollaboratorsService;
  let taskPermissionService: TaskPermissionService;
  let collaboratorRepository: CollaboratorRepository;
  let userRepository: UserRepository;
  let taskRepository: TaskRepository;
  let taskPermissionSpy: jest.SpyInstance;

  const mockcollaboratorRepository = {
    findUnique: jest.fn(),
  };

  const mockTaskRepository = {
    findUnique: jest.fn(),
  };

  const mockUserRepository = {
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaboratorsService,
        TaskPermissionService,
        {
          provide: CollaboratorRepository,
          useValue: mockcollaboratorRepository,
        },
        {
          provide: TaskRepository,
          useValue: mockTaskRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    collaboratorsService =
      module.get<CollaboratorsService>(CollaboratorsService);
    taskPermissionService = module.get<TaskPermissionService>(
      TaskPermissionService,
    );
    collaboratorRepository = module.get<CollaboratorRepository>(
      CollaboratorRepository,
    );
    taskRepository = module.get<TaskRepository>(TaskRepository);
    userRepository = module.get<UserRepository>(UserRepository);
    taskPermissionSpy = jest.spyOn(
      taskPermissionService,
      'hasOperationPermission',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    taskPermissionSpy.mockRestore();
  });

  describe('getCollaborators', () => {
    it('should retrun list of collaborators', async () => {
      const mockUser = generateUserJWTPayload(UserType.ADMIN);
      const mockTask = generateTask();
      const mockCollabollatorInfo = generateTaskWithCollaboratorData(
        2,
        mockTask,
      );
      mockTaskRepository.findUnique.mockResolvedValue(mockCollabollatorInfo);
      const result = await collaboratorsService.getCollaborators(mockUser, {
        ...mockTask,
        creatorId: mockUser.id,
      });
      expect(taskPermissionService.hasOperationPermission).toHaveBeenCalled();
      expect(taskRepository.findUnique).toHaveBeenCalled();
      expect(result.id).toEqual(mockTask.id);
    });
  });
});
