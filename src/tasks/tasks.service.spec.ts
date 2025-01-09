import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { Prisma, UserType } from '@prisma/client';

import { faker } from '@faker-js/faker/.';

import { TaskService } from './tasks.service';
import { TaskPermissionService } from '../helpers/task-permission.helper.service';
import { ErrorHandlerService } from '../helpers/error.helper.service';
import { AssociateService } from '../associates/associates.service';

import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

import { TaskStatus } from './task.model';

import {
  ERROR_NAME,
  RESPONSE_MESSAGE,
  TASK_RESPONSE_MESSAGE,
} from '../utils/constants';
import { TaskRepository } from './tasks.repository';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { TaskRepositoryMock } from './__mock__/task.repository.mock';
import { AssociateServiceMock } from '../associates/__mock__/associates.service.mock';
import {
  generateTask,
  generateTaskDto,
  generateTasks,
} from './__mock__/task-data.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { generateUserAffiliatedTo } from '../associates/__mock__/associate-data.mock';

describe('TaskService', () => {
  let service: TaskService;
  let associateService: AssociateService;
  let taskRepository: TaskRepository;

  const currentUser = mockUser();
  const currentAdminUser = { ...currentUser, userType: UserType.ADMIN };
  const currentSuperUser = { ...currentUser, userType: UserType.SUPER };

  const usertokenPayload = mockTokenPayload(currentUser);
  const adminUserTokenPayload = mockTokenPayload(currentAdminUser);
  const superUserTokenPayload = mockTokenPayload(currentSuperUser);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: AssociateService, useValue: AssociateServiceMock },
        { provide: TaskRepository, useValue: TaskRepositoryMock },
        TaskPermissionService,
        ErrorHandlerService,
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    associateService = module.get<AssociateService>(AssociateService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return the tasks when filterDto is empty', async () => {
      const filterDto = {} as GetTasksFilterDto;
      const mockTasks = generateTasks();
      TaskRepositoryMock.findMany.mockResolvedValue(mockTasks);
      const result = await service.getTasks(usertokenPayload, filterDto);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            title: expect.any(String),
            description: expect.any(String),
            creatorId: expect.any(Number),
            status: expect.any(String),
            budget: expect.any(Number),
          }),
        ]),
      );
      expect(taskRepository.findMany).toHaveBeenCalled();
      expect(taskRepository.findMany).toHaveBeenCalled();
    });

    it('should return empty array when tasks matching filterDto is absent', async () => {
      const filterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: faker.lorem.word(),
      } as GetTasksFilterDto;
      TaskRepositoryMock.findMany.mockResolvedValue([]);
      const result = await service.getTasks(usertokenPayload, filterDto);
      expect(result).toEqual([]);
      expect(taskRepository.findMany).toHaveBeenCalled();
      expect(taskRepository.findMany).toHaveBeenCalledWith({
        where: {
          status: filterDto.status,
          OR: [
            { title: { contains: filterDto.search } },
            { description: { contains: filterDto.search } },
          ],
          members: {
            some: {
              memberId: usertokenPayload.id,
            },
          },
        },
      });
    });
  });

  describe('getTaskById', () => {
    const mockTaskData = generateTask();

    describe('should return task response object matched with the Id', () => {
      const { id: taskId } = mockTaskData;
      it('when usertype is super', async () => {
        TaskRepositoryMock.findFirst.mockResolvedValue(mockTaskData);
        const result = await service.getTaskById(taskId, superUserTokenPayload);

        expect(taskRepository.findFirst).toHaveBeenCalledWith({
          where: { id: taskId },
        });

        expect(result.id).toEqual(mockTaskData.id);
      });

      it('when usertype is not super', async () => {
        TaskRepositoryMock.findFirst.mockResolvedValue(mockTaskData);
        const result = await service.getTaskById(taskId, adminUserTokenPayload);
        expect(taskRepository.findFirst).toHaveBeenCalledWith({
          where: {
            id: taskId,
            OR: [
              { creatorId: adminUserTokenPayload.id },
              {
                members: {
                  some: {
                    memberId: adminUserTokenPayload.id,
                  },
                },
              },
            ],
          },
        });
        expect(result.id).toEqual(taskId);
      });
    });

    it('should raise NotFoundException when task with id does not exist', async () => {
      const indvalidTaskId = faker.number.int({ min: 1 });
      TaskRepositoryMock.findFirst.mockResolvedValue(null);
      await expect(
        service.getTaskById(indvalidTaskId, superUserTokenPayload),
      ).rejects.toThrow(NotFoundException);
      expect(taskRepository.findFirst).toHaveBeenCalledWith({
        where: { id: indvalidTaskId },
      });
    });
  });

  describe('createTask', () => {
    it('should save a task successfully', async () => {
      const userAffiliatedTo = generateUserAffiliatedTo({
        userId: adminUserTokenPayload.id,
        numOfRecords: 3,
      });
      const mockTaskDto = {
        ...generateTaskDto(),
        enterpriseId: userAffiliatedTo[0].enterpriseId,
      };
      const data = generateTask(mockTaskDto);
      TaskRepositoryMock.create.mockResolvedValue(data);

      AssociateServiceMock.userAssociatesTo.mockResolvedValueOnce(
        userAffiliatedTo,
      );

      await service.createTask(mockTaskDto, adminUserTokenPayload);

      expect(taskRepository.create).toHaveBeenCalledWith({
        ...mockTaskDto,
        creatorId: adminUserTokenPayload.id,
        status: TaskStatus.OPEN,
        budget: new Prisma.Decimal(mockTaskDto.budget),
      });
      expect(associateService.userAssociatesTo).toHaveBeenCalledWith(
        adminUserTokenPayload.id,
      );
    });
  });

  describe('deleteTask', () => {
    const mockTaskData = generateTask();
    it('should delete task by id', async () => {
      TaskRepositoryMock.findUniqueOrThrow.mockResolvedValue({
        ...mockTaskData,
        creatorId: adminUserTokenPayload.id,
      });

      const result = await service.deleteTask(
        mockTaskData.id,
        adminUserTokenPayload,
      );

      expect(result).toEqual(TASK_RESPONSE_MESSAGE.DELETE_TASK);
    });

    it('should raise error when user does not have permission', async () => {
      TaskRepositoryMock.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      const expectedError = new ForbiddenException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      );

      try {
        await service.deleteTask(mockTaskData.id, usertokenPayload);
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
  });

  describe('updateTask', () => {
    const updateTaskDto = generateTaskDto();
    const mockTaskData = generateTask();
    it('should throw error when user does not have permission', async () => {
      const { id: validTaskId } = mockTaskData;
      TaskRepositoryMock.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      const expectedError = new ForbiddenException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      );

      try {
        await service.updateTask(validTaskId, updateTaskDto, usertokenPayload);
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
    it('should update task successfully', async () => {
      const { id: validTaskId } = mockTaskData;
      const query = { where: { id: validTaskId } };
      TaskRepositoryMock.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      const updatedTask = { ...mockTaskData, ...updateTaskDto };
      TaskRepositoryMock.update.mockResolvedValue(updatedTask);
      const result = await service.updateTask(
        validTaskId,
        updateTaskDto,
        superUserTokenPayload,
      );
      expect(taskRepository.update).toHaveBeenCalledWith(query, updateTaskDto);
      expect(result).toEqual(updatedTask);
    });
  });

  describe('updateTaskStatus', () => {
    const mockTaskData = generateTask();
    it('should throw error when user does not have permission', async () => {
      const { id: validTaskId } = mockTaskData;
      TaskRepositoryMock.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      const expectedError = new ForbiddenException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      );
      try {
        await service.updateTaskStatus(
          validTaskId,
          TaskStatus.IN_PROGRESS,
          usertokenPayload,
        );
      } catch (error) {
        expect(error).toEqual(expectedError);
      }
    });
    it('should update task status successfully', async () => {
      const { id: validTaskId } = mockTaskData;
      TaskRepositoryMock.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      TaskRepositoryMock.update.mockResolvedValue({
        ...mockTaskData,
        status: TaskStatus.IN_PROGRESS,
      });

      const result = await service.updateTaskStatus(
        validTaskId,
        TaskStatus.IN_PROGRESS,
        superUserTokenPayload,
      );

      expect({ ...result }).toEqual({
        ...mockTaskData,
        status: TaskStatus.IN_PROGRESS,
      });
    });
  });
});
