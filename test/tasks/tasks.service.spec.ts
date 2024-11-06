import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../../src/tasks/tasks.service';
import { TaskPermissionService } from '../../src/helpers/task-permission.helper.service';
import { generateUserJWTPayload } from '../mock-data/auth.mock';
import { Prisma, UserType } from '@prisma/client';
import { GetTasksFilterDto } from '../../src/tasks/dto/get-tasks-filter.dto';
import {
  generateTask,
  generateTaskDto,
  generateTasks,
} from '../mock-data/task.mock';

import { ForbiddenException, NotFoundException } from '@nestjs/common';

import {
  RESPONSE_MESSAGE,
  TASK_RESPONSE_MESSAGE,
} from '../../src/utils/constants';
import { faker } from '@faker-js/faker/.';
import { TaskStatus } from '../../src/tasks/task.model';
import { ErrorHandlerService } from '../../src/helpers/error.helper.service';
import { TaskRepository } from '../../src/tasks/repositories/task.repository';

describe('TaskService', () => {
  let taskService: TasksService;
  let taskPermissionService: TaskPermissionService;
  let taskRepository: TaskRepository;
  let taskPermissionServiceSpy: jest.SpyInstance;

  const mockTaskRepository = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockUser = generateUserJWTPayload(UserType.USER);
  const mockAdminUser = generateUserJWTPayload(UserType.ADMIN);
  const mockSuperUser = generateUserJWTPayload(UserType.SUPER);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useValue: mockTaskRepository },
        TaskPermissionService,
        ErrorHandlerService,
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);
    taskRepository = module.get<TaskRepository>(TaskRepository);
    taskPermissionService = module.get<TaskPermissionService>(
      TaskPermissionService,
    );
    taskPermissionServiceSpy = jest.spyOn(
      taskPermissionService,
      'hasOperationPermission',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    taskPermissionServiceSpy.mockClear();
  });

  describe('getTasks', () => {
    it('should return the tasks when filterDto is empty', async () => {
      const filterDto = {} as GetTasksFilterDto;
      const mockTasks = generateTasks();

      mockTaskRepository.findMany.mockResolvedValue(mockTasks);
      const result = await taskService.getTasks(mockUser, filterDto);
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
      mockTaskRepository.findMany.mockResolvedValue([]);
      const result = await taskService.getTasks(mockUser, filterDto);
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
              memberId: mockUser.id,
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
        mockTaskRepository.findFirst.mockResolvedValue(mockTaskData);
        const result = await taskService.getTaskById(taskId, mockSuperUser);

        expect(mockTaskRepository.findFirst).toHaveBeenCalledWith({
          where: { id: taskId },
        });

        expect(result.id).toEqual(mockTaskData.id);
      });

      it('when usertype is not super', async () => {
        mockTaskRepository.findFirst.mockResolvedValue(mockTaskData);
        const result = await taskService.getTaskById(taskId, mockAdminUser);
        expect(mockTaskRepository.findFirst).toHaveBeenCalledWith({
          where: {
            id: taskId,
            OR: [
              { creatorId: mockAdminUser.id },
              {
                members: {
                  some: {
                    memberId: mockAdminUser.id,
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
      mockTaskRepository.findFirst.mockResolvedValue(null);
      await expect(
        taskService.getTaskById(indvalidTaskId, mockSuperUser),
      ).rejects.toThrow(NotFoundException);
      expect(mockTaskRepository.findFirst).toHaveBeenCalledWith({
        where: { id: indvalidTaskId },
      });
    });
  });

  describe('createTask', () => {
    it('should save a task successfully', async () => {
      const mockTaskDto = generateTaskDto();
      const data = generateTask(mockTaskDto);
      mockTaskRepository.create.mockResolvedValue(data);
      await taskService.createTask(mockTaskDto, mockAdminUser.id);
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...mockTaskDto,
        creatorId: mockAdminUser.id,
        status: TaskStatus.OPEN,
        budget: new Prisma.Decimal(mockTaskDto.budget),
      });
    });
  });

  describe('deleteTask', () => {
    const mockTaskData = generateTask();
    it('should delete task by id', async () => {
      mockTaskRepository.findUniqueOrThrow.mockResolvedValue({
        ...mockTaskData,
        creatorId: mockAdminUser.id,
      });

      const result = await taskService.deleteTask(
        mockTaskData.id,
        mockAdminUser,
      );

      expect(result).toEqual(TASK_RESPONSE_MESSAGE.DELETE_TASK);
    });

    it('should raise error when user does not have permission', async () => {
      mockTaskRepository.findUniqueOrThrow.mockResolvedValue(mockTaskData);

      await expect(
        taskService.deleteTask(mockTaskData.id, mockUser),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        taskService.deleteTask(mockTaskData.id, mockUser),
      ).rejects.toMatchObject({
        message: RESPONSE_MESSAGE.PERMISSION_DENIED,
      });
      expect(taskPermissionService.hasOperationPermission).toHaveBeenCalledWith(
        mockUser,
        mockTaskData,
      );
    });
  });

  describe('updateTask', () => {
    const updateTaskDto = generateTaskDto();
    const mockTaskData = generateTask();
    it('should throw error when user does not have permission', async () => {
      const { id: validTaskId } = mockTaskData;
      mockTaskRepository.findUniqueOrThrow.mockResolvedValue(mockTaskData);

      await expect(
        taskService.updateTask(validTaskId, updateTaskDto, mockUser),
      ).rejects.toThrow(ForbiddenException);

      expect(taskPermissionService.hasOperationPermission).toHaveBeenCalledWith(
        mockUser,
        mockTaskData,
      );
    });
    it('should update task successfully', async () => {
      const { id: validTaskId } = mockTaskData;
      const query = { where: { id: validTaskId } };
      mockTaskRepository.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      const updatedTask = { ...mockTaskData, ...updateTaskDto };
      mockTaskRepository.update.mockResolvedValue(updatedTask);
      const result = await taskService.updateTask(
        validTaskId,
        updateTaskDto,
        mockSuperUser,
      );
      expect(taskRepository.update).toHaveBeenCalledWith(query, updateTaskDto);
      expect(result).toEqual(updatedTask);
    });
  });

  describe('updateTaskStatus', () => {
    const mockTaskData = generateTask();
    it('should throw error when user does not have permission', async () => {
      const { id: validTaskId } = mockTaskData;
      mockTaskRepository.findUniqueOrThrow.mockResolvedValue(mockTaskData);

      await expect(
        taskService.updateTaskStatus(
          validTaskId,
          TaskStatus.IN_PROGRESS,
          mockUser,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(taskPermissionService.hasOperationPermission).toHaveBeenCalledWith(
        mockUser,
        mockTaskData,
      );
    });
    it('should update task status successfully', async () => {
      const { id: validTaskId } = mockTaskData;
      mockTaskRepository.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      mockTaskRepository.update.mockResolvedValue({
        ...mockTaskData,
        status: TaskStatus.IN_PROGRESS,
      });

      const result = await taskService.updateTaskStatus(
        validTaskId,
        TaskStatus.IN_PROGRESS,
        mockSuperUser,
      );

      expect({ ...result }).toEqual({
        ...mockTaskData,
        status: TaskStatus.IN_PROGRESS,
      });
    });
  });
});
