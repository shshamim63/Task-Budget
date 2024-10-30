import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../../src/tasks/tasks.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TaskPermissionService } from '../../src/helpers/task-permission-helper.service';
import { generateUserJWTPayload } from '../mock-data/auth.mock';
import { UserType } from '@prisma/client';
import { GetTasksFilterDto } from '../../src/tasks/dto/get-tasks-filter.dto';
import {
  generateTask,
  generateTaskDto,
  generateTasks,
} from '../mock-data/task.mock';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { PRISMA_ERROR_CODE } from '../../src/prisma/prisma-error-code';
import {
  RESPONSE_MESSAGE,
  TASK_RESPONSE_MESSAGE,
} from '../../src/utils/constants';
import { faker } from '@faker-js/faker/.';
import { TaskStatus } from '../../src/tasks/task.model';

describe('TaskService', () => {
  let taskService: TasksService;
  let prismaService: PrismaService;
  let taskPermissionService: TaskPermissionService;
  let taskPermissionSpy: jest.SpyInstance;

  const mockPrismaService = {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockUser = generateUserJWTPayload(UserType.USER);
  const mockAdminUser = generateUserJWTPayload(UserType.ADMIN);
  const mockSuperUser = generateUserJWTPayload(UserType.SUPER);

  const mockTasks = generateTasks();
  const mockTaskData = generateTask();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        TaskPermissionService,
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
    taskPermissionService = module.get<TaskPermissionService>(
      TaskPermissionService,
    );
    taskPermissionSpy = jest.spyOn(
      taskPermissionService,
      'hasOperationPermission',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    taskPermissionSpy.mockRestore();
  });

  describe('getTasks', () => {
    it('should return the tasks when filterDto is empty', async () => {
      const filterDto = {} as GetTasksFilterDto;
      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
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
      expect(prismaService.task.findMany).toHaveBeenCalled();
    });

    it('should return empty array when tasks matching filterDto is absent', async () => {
      const filterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: faker.lorem.word(),
      } as GetTasksFilterDto;
      mockPrismaService.task.findMany.mockResolvedValue([]);
      const result = await taskService.getTasks(mockUser, filterDto);
      expect(result).toEqual([]);
      expect(prismaService.task.findMany).toHaveBeenCalled();
      expect(prismaService.task.findMany).toHaveBeenCalledWith({
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
    describe('should return task response object matched with the Id', () => {
      const { id: taskId } = mockTaskData;
      it('when usertype is super', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTaskData);
        const result = await taskService.getTaskById(taskId, mockSuperUser);
        expect(mockPrismaService.task.findFirst).toHaveBeenCalledWith({
          where: { id: taskId },
        });
        expect(result.id).toEqual(mockTaskData.id);
      });

      it('when usertype is not super', async () => {
        mockPrismaService.task.findFirst.mockResolvedValue(mockTaskData);
        const result = await taskService.getTaskById(taskId, mockAdminUser);
        expect(mockPrismaService.task.findFirst).toHaveBeenCalledWith({
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
      mockPrismaService.task.findFirst.mockResolvedValue(null);
      await expect(
        taskService.getTaskById(indvalidTaskId, mockSuperUser),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.task.findFirst).toHaveBeenCalledWith({
        where: { id: indvalidTaskId },
      });
    });
  });

  describe('createTask', () => {
    it('should save a task successfully', async () => {
      const mockTaskDto = generateTaskDto();

      mockPrismaService.task.create.mockResolvedValue({
        ...mockTaskData,
        ...mockTaskDto,
      });
      const result = await taskService.createTask(
        mockTaskDto,
        mockAdminUser.id,
      );
      expect(prismaService.task.create).toHaveBeenCalled();
      expect(result).toBeTruthy();
    });

    it('should throw error when task with title already exist', async () => {
      const mockTaskDto = generateTaskDto();

      mockPrismaService.task.create.mockRejectedValue(
        new PrismaClientKnownRequestError(
          'Unique constraint failed on the field: task.title',
          {
            code: 'P2002',
            clientVersion: '1.0.0',
            meta: { target: ['title'] },
            batchRequestIdx: 1,
          },
        ),
      );

      await expect(
        taskService.createTask(mockTaskDto, mockAdminUser.id),
      ).rejects.toThrow(
        new HttpException(
          PRISMA_ERROR_CODE.P2002.response,
          PRISMA_ERROR_CODE.P2002.status,
        ),
      );

      expect(prismaService.task.create).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete task by id', async () => {
      mockPrismaService.task.findUniqueOrThrow.mockResolvedValue({
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
      mockPrismaService.task.findUniqueOrThrow.mockResolvedValue(mockTaskData);

      await expect(
        taskService.deleteTask(mockTaskData.id, mockUser),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        taskService.deleteTask(mockTaskData.id, mockUser),
      ).rejects.toMatchObject({
        message: RESPONSE_MESSAGE.PERMISSION_DENIED,
      });
      expect(taskPermissionSpy).toHaveBeenCalled();
    });

    it('should raise error when task with id does not exist', async () => {
      const invalidId = faker.number.int({ min: 1 });
      mockPrismaService.task.findUniqueOrThrow.mockRejectedValue(
        new PrismaClientKnownRequestError('Task does not exit', {
          code: 'P2025',
          clientVersion: '1.0.0',
          meta: {},
          batchRequestIdx: 1,
        }),
      );
      await expect(taskService.deleteTask(invalidId, mockUser)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('updateTask', () => {
    const updateTaskDto = generateTaskDto();
    it('should raise error when task with id does not exist', async () => {
      const invalidTaskId = faker.number.int({ min: 1 });
      mockPrismaService.task.findUniqueOrThrow.mockRejectedValue(
        new PrismaClientKnownRequestError('Task does not exit', {
          code: 'P2025',
          clientVersion: '1.0.0',
          meta: {},
          batchRequestIdx: 1,
        }),
      );

      await expect(
        taskService.updateTask(invalidTaskId, updateTaskDto, mockSuperUser),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when user does not have permission', async () => {
      const { id: validTaskId } = mockTaskData;
      mockPrismaService.task.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      await expect(
        taskService.updateTask(validTaskId, updateTaskDto, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });
    it('should update task successfully', async () => {
      const { id: validTaskId } = mockTaskData;
      mockPrismaService.task.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      mockPrismaService.task.update.mockResolvedValue({
        ...mockTaskData,
        ...updateTaskDto,
      });
      const result = await taskService.updateTask(
        validTaskId,
        updateTaskDto,
        mockSuperUser,
      );
      expect(result).toEqual({
        ...mockTaskData,
        ...updateTaskDto,
      });
    });
  });

  describe('updateTaskStatus', () => {
    it('should raise error when task with id does not exist', async () => {
      const invalidTaskId = faker.number.int({ min: 1 });
      mockPrismaService.task.findUniqueOrThrow.mockRejectedValue(
        new PrismaClientKnownRequestError('Task does not exit', {
          code: 'P2025',
          clientVersion: '1.0.0',
          meta: {},
          batchRequestIdx: 1,
        }),
      );

      await expect(
        taskService.updateTaskStatus(
          invalidTaskId,
          TaskStatus.IN_PROGRESS,
          mockSuperUser,
        ),
      ).rejects.toThrow(HttpException);
    });

    it('should throw error when user does not have permission', async () => {
      const { id: validTaskId } = mockTaskData;
      mockPrismaService.task.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      await expect(
        taskService.updateTaskStatus(
          validTaskId,
          TaskStatus.IN_PROGRESS,
          mockUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
    it('should update task status successfully', async () => {
      const { id: validTaskId } = mockTaskData;
      mockPrismaService.task.findUniqueOrThrow.mockResolvedValue(mockTaskData);
      mockPrismaService.task.update.mockResolvedValue({
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
