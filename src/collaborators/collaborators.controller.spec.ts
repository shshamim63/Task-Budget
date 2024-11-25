import { Test, TestingModule } from '@nestjs/testing';

import { ForbiddenException } from '@nestjs/common';

import { UserType } from '@prisma/client';

import { generateTask } from '../tasks/__mock__/task-data.mock';

import { CollaboratorController } from './collaborators.controller';
import { CollaboratorService } from './collaborators.service';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';

import { TaskResponseDto } from '../tasks/dto/task.dto';
import { CreateCollaboratorsDto } from './dto/create-collaborators.dto';
import {
  generateCollaboratorId,
  generateCollaboratorList,
  generateTaskWithCollaboratorData,
} from './__mock__/collaborators-data.mock';
import { CollaboratorServiceMock } from './__mock__/collaborators.service.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';

describe('CollaboratorController', () => {
  let controller: CollaboratorController;
  let service: CollaboratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorController],
      providers: [
        { provide: CollaboratorService, useValue: CollaboratorServiceMock },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActive: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActive: jest.fn(() => true) })
      .overrideInterceptor(TaskInterceptor)
      .useValue({ intercept: jest.fn((ctx, next) => next.handle()) })
      .compile();

    controller = module.get<CollaboratorController>(CollaboratorController);
    service = module.get<CollaboratorService>(CollaboratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCollaborators', () => {
    it('should return the list of collaborators', async () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentAdminUserPayload = mockTokenPayload(currentAdminUser);

      const task: TaskResponseDto = generateTask();
      const collaborators = generateTaskWithCollaboratorData(2, task);
      CollaboratorServiceMock.getCollaborators.mockResolvedValue(collaborators);

      const result = await controller.getCollaborators(
        currentAdminUserPayload,
        task,
      );

      expect(result).toEqual(collaborators);
      expect(service.getCollaborators).toHaveBeenCalled();
    });
    it('should deny access when user is not super or admin', async () => {
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);

      const task: TaskResponseDto = generateTask();

      jest
        .spyOn(RolesGuard.prototype, 'canActivate')
        .mockImplementationOnce(() => false);

      try {
        await controller.getCollaborators(currentUserPayload, task);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('assignMember', () => {
    const createCollaboratorsList = generateCollaboratorList(3);
    const createCollaboratorsDto: CreateCollaboratorsDto = {
      collaborators: createCollaboratorsList.map((data) => data.id),
    };
    it('should deny access when user is neither admin nor super', async () => {
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);

      const task: TaskResponseDto = generateTask();

      jest
        .spyOn(RolesGuard.prototype, 'canActivate')
        .mockImplementationOnce(() => false);

      try {
        await controller.assignMember(
          createCollaboratorsDto,
          currentUserPayload,
          task,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should successfully assign members as a task contributors', async () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentAdminUserPayload = mockTokenPayload(currentAdminUser);

      const task: TaskResponseDto = generateTask();

      CollaboratorServiceMock.assignMember.mockResolvedValue(
        `Assigned members to the task with id: ${task.id}`,
      );
      const result = await controller.assignMember(
        createCollaboratorsDto,
        currentAdminUserPayload,
        task,
      );
      expect(result).toEqual(
        `Assigned members to the task with id: ${task.id}`,
      );
    });
  });

  describe('removeCollaborator', () => {
    it('should remove a user from the task collaborator', async () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentAdminUserPayload = mockTokenPayload(currentAdminUser);

      const task: TaskResponseDto = generateTask();
      const { collaboratorId } = generateCollaboratorId();

      CollaboratorServiceMock.removeCollaborator.mockResolvedValue(
        `Removed member with id: ${collaboratorId} from task with id: ${task.id}`,
      );

      const result = await controller.removeCollaborator(
        collaboratorId,
        currentAdminUserPayload,
        { ...task, creatorId: currentAdminUser.id },
      );

      expect(typeof result).toEqual('string');
    });
  });
});
