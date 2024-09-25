import { Test, TestingModule } from '@nestjs/testing';

import { faker } from '@faker-js/faker';

import { CollaboratorsController } from './collaborators.controller';
import { CollaboratorsService } from './collaborators.service';
import { TaskStatus, UserType } from '@prisma/client';
import { AuthGuard } from '../auth/guards/auth.guard';
import { TaskInterceptor } from '../tasks/interceptors/task.interceptor';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { TaskResponseDto } from '../tasks/dto/task.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ForbiddenException } from '@nestjs/common';
import { CreateCollaboratorsDto } from './dto/create-collaborators.dto';

describe('CollaboratorsController', () => {
  let collaboratorsController: CollaboratorsController;
  let collaboratorsService: CollaboratorsService;

  const mockService = {
    getCollaborators: jest.fn(),
    assignMember: jest.fn(),
    removeCollaborator: jest.fn(),
  };

  const mockUser: JWTPayload = {
    email: faker.internet.email(),
    id: faker.number.int(),
    username: faker.internet.userName(),
    userType: UserType.USER,
    exp: faker.number.int(),
    iat: faker.number.int(),
  };

  const mockTask: TaskResponseDto = {
    id: faker.number.int(),
    title: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    creatorId: faker.number.int(),
    status: TaskStatus.OPEN,
    budget: faker.number.float(),
  };

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
      const collaborators = [
        {
          id: faker.number.int(),
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          status: TaskStatus.OPEN,
          budget: faker.number.int(),
          creator: {
            id: faker.number.int(),
            username: faker.internet.userName(),
            email: faker.internet.email(),
            userType: UserType.ADMIN,
          },
          members: [
            {
              id: faker.number.int(),
              username: faker.internet.userName(),
              email: faker.internet.email(),
            },
          ],
        },
      ];

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

    it('should deny access when user is not a admin or super', async () => {
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
});
