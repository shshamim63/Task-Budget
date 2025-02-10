import { Test, TestingModule } from '@nestjs/testing';
import { CollaboratorService } from '../../src/collaborators/collaborators.service';
import { TaskPermissionService } from '../../src/helpers/task-permission.helper.service';

import { TaskRepository } from '../tasks/tasks.repository';
import { CollaboratorRepository } from './collaborator.repository';

import { CollaboratorRepositoryMock } from './__mock__/collaborator.repository.mock';
import { TaskRepositoryMock } from '../tasks/__mock__/task.repository.mock';

import { mockUser } from '../auth/__mock__/auth-data.mock';
import { generateTask } from '../tasks/__mock__/task-data.mock';
import {
  generateCollaboratorList,
  generateTaskWithCollaboratorData,
} from './__mock__/collaborators-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { ForbiddenException } from '@nestjs/common';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../utils/constants';
import { UserType } from '@prisma/client';
import { faker } from '@faker-js/faker/.';
import { CreateCollaboratorsDto } from './dto/create-collaborators.dto';
import { UserRepository } from '../users/user.repository';
import { UserRepositoryMock } from '../users/__mock__/user.repository.mock';
describe('CollaboratorService', () => {
  let service: CollaboratorService;
  let taskPermissionService: TaskPermissionService;
  let collaboratorRepository: CollaboratorRepository;
  let userRepository: UserRepository;
  let taskRepository: TaskRepository;
  let taskPermissionSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaboratorService,
        TaskPermissionService,
        {
          provide: CollaboratorRepository,
          useValue: CollaboratorRepositoryMock,
        },
        {
          provide: TaskRepository,
          useValue: TaskRepositoryMock,
        },
        {
          provide: UserRepository,
          useValue: UserRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<CollaboratorService>(CollaboratorService);
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
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const userTokenPayload = mockTokenPayload(currentAdminUser);
      const task = generateTask();
      const mockCollabollatorInfo = generateTaskWithCollaboratorData(2, task);

      TaskRepositoryMock.findUnique.mockResolvedValueOnce(
        mockCollabollatorInfo,
      );

      const result = await service.getCollaborators(userTokenPayload, {
        ...task,
        creatorId: userTokenPayload.id,
      });

      expect(taskPermissionService.hasOperationPermission).toHaveBeenCalled();
      expect(taskRepository.findUnique).toHaveBeenCalled();
      expect(result.id).toEqual(task.id);
    });
    it('should raise ForbiddenException when user does not have permission', async () => {
      const currentUser = mockUser();
      const userTokenPayload = mockTokenPayload(currentUser);
      const mockTask = generateTask();
      const expectedError = new ForbiddenException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      );
      try {
        await service.getCollaborators(userTokenPayload, mockTask);
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
  });

  describe('assignMember', () => {
    it('should raise ForbiddenException when user does not havee permission', async () => {
      const currentUser = mockUser();
      const userTokenPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      const createCollaboratorsList = generateCollaboratorList(3);
      const createCollaboratorsDto: CreateCollaboratorsDto = {
        collaborators: createCollaboratorsList.map((data) => data.id),
      };
      const expectedError = new ForbiddenException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      );
      try {
        await service.assignMember(
          createCollaboratorsDto,
          userTokenPayload,
          task,
        );
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
    it('should assign collaborators successfully', async () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const userTokenPayload = mockTokenPayload(currentAdminUser);
      const task = { ...generateTask(), creatorId: currentAdminUser.id };
      const createCollaboratorsList = generateCollaboratorList(3);
      const createCollaboratorsDto: CreateCollaboratorsDto = {
        collaborators: createCollaboratorsList.map((data) => data.id),
      };

      UserRepositoryMock.findMany.mockResolvedValueOnce(
        createCollaboratorsList,
      );
      CollaboratorRepositoryMock.createMany.mockResolvedValueOnce(true);

      const result = await service.assignMember(
        createCollaboratorsDto,
        userTokenPayload,
        task,
      );

      expect(result).toEqual(
        `Assigned members to the task with id: ${task.id}`,
      );
      expect(collaboratorRepository.createMany).toHaveBeenCalled();
      expect(userRepository.findMany).toHaveBeenCalled();
    });
  });

  describe('removeCollaborator', () => {
    const validContributorId = faker.number.int({ min: 1 });
    it('should raise ForbiddenException when user does not havee permission', async () => {
      const currentUser = mockUser();
      const userTokenPayload = mockTokenPayload(currentUser);

      const task = generateTask();

      const expectedError = new ForbiddenException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      );

      try {
        await service.removeCollaborator(
          userTokenPayload,
          task,
          validContributorId,
        );
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
    it('should remove collaborator successfully', async () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const userTokenPayload = mockTokenPayload(currentAdminUser);
      const task = { ...generateTask(), creatorId: currentAdminUser.id };

      CollaboratorRepositoryMock.delete.mockResolvedValueOnce(true);

      const result = await service.removeCollaborator(
        userTokenPayload,
        task,
        validContributorId,
      );

      expect(result).toEqual(
        `Removed member with id: ${validContributorId} from task with id: ${task.id}`,
      );
      expect(collaboratorRepository.delete).toHaveBeenCalled();
    });
  });
});
