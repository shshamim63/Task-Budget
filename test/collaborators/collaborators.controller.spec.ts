import { Test, TestingModule } from '@nestjs/testing';

import { ForbiddenException } from '@nestjs/common';

import { faker } from '@faker-js/faker';

import { UserType } from '@prisma/client';

import { generateUserJWTPayload } from '../mock-data/auth.mock';
import { generateTask } from '../mock-data/task.mock';

import { CollaboratorsController } from '../../src/collaborators/collaborators.controller';
import { CollaboratorsService } from '../../src/collaborators/collaborators.service';

import { JWTPayload } from '../../src/auth/interfaces/auth.interface';

import { AuthGuard } from '../../src/auth/guards/auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';

import { TaskInterceptor } from '../../src/tasks/interceptors/task.interceptor';

import { TaskResponseDto } from '../../src/tasks/dto/task.dto';
import { CreateCollaboratorsDto } from '../../src/collaborators/dto/create-collaborators.dto';
import {
  generateCollaboratorId,
  generateMockCollaboratorsResponse,
} from '../mock-data/collaborators.mock';

describe('CollaboratorsController', () => {
  let collaboratorsController: CollaboratorsController;
  let collaboratorsService: CollaboratorsService;

  const mockService = {
    getCollaborators: jest.fn(),
    assignMember: jest.fn(),
    removeCollaborator: jest.fn(),
  };

  const mockUser: JWTPayload = generateUserJWTPayload(UserType.USER);

  const mockTask: TaskResponseDto = generateTask();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorsController],
      providers: [{ provide: CollaboratorsService, useValue: mockService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActive: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActive: jest.fn(() => true) })
      .overrideInterceptor(TaskInterceptor)
      .useValue({ intercept: jest.fn((ctx, next) => next.handle()) })
      .compile();

    collaboratorsController = module.get<CollaboratorsController>(
      CollaboratorsController,
    );
    collaboratorsService =
      module.get<CollaboratorsService>(CollaboratorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCollaborators', () => {
    it('should return the list of collaborators', async () => {
      const collaborators = generateMockCollaboratorsResponse();

      mockService.getCollaborators.mockResolvedValue(collaborators);
      const result = await collaboratorsController.getCollaborators(
        { ...mockUser, userType: UserType.ADMIN },
        mockTask,
      );
      expect(result).toEqual(collaborators);
      expect(collaboratorsService.getCollaborators).toHaveBeenCalled();
    });
    it('should deny access when user is not super or admin', async () => {
      jest
        .spyOn(RolesGuard.prototype, 'canActivate')
        .mockImplementationOnce(() => false);

      try {
        await collaboratorsController.getCollaborators(mockUser, mockTask);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('assignMember', () => {
    const createCollaboratorsDto: CreateCollaboratorsDto = {
      collaborators: faker.helpers.arrayElements(Array.from(Array(10).keys()), {
        min: 0,
        max: 4,
      }),
    };

    it('should deny access when user is neither admin nor super', async () => {
      jest
        .spyOn(RolesGuard.prototype, 'canActivate')
        .mockImplementationOnce(() => false);

      try {
        await collaboratorsController.assignMember(
          createCollaboratorsDto,
          mockUser,
          mockTask,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should successfully assign members as a task contributors', async () => {
      mockService.assignMember.mockResolvedValue(
        `Assigned members to the task with id: ${mockTask.id}`,
      );
      const result = await collaboratorsController.assignMember(
        createCollaboratorsDto,
        { ...mockUser, userType: UserType.ADMIN },
        mockTask,
      );
      expect(result).toEqual(
        `Assigned members to the task with id: ${mockTask.id}`,
      );
    });
  });

  describe('removeCollaborator', () => {
    it('should remove a user from the task collaborator', async () => {
      const { collaboratorId } = generateCollaboratorId();
      const mockUser = generateUserJWTPayload(UserType.ADMIN);
      const mockTask = generateTask();
      mockService.removeCollaborator.mockResolvedValue(
        `Removed member with id: ${collaboratorId} from task with id: ${mockTask.id}`,
      );
      const result = await collaboratorsController.removeCollaborator(
        collaboratorId,
        mockUser,
        { ...mockTask, creatorId: mockUser.id },
      );
      expect(typeof result).toEqual('string');
    });
  });
});
