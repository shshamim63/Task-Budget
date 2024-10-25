import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../../src/tasks/tasks.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TaskPermissionService } from '../../src/helpers/task-permission-helper.service';
import { generateUserJWTPayload } from '../helpers/auth.helpers';
import { UserType } from '@prisma/client';
import { GetTasksFilterDto } from '../../src/tasks/dto/get-tasks-filter.dto';
import { generateTasks } from '../helpers/task.helpers';

describe('TaskService', () => {
  let taskService: TasksService;
  let prismaService: PrismaService;
  let taskPermissionService: TaskPermissionService;

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

  const mockTaskPermissionService = {
    hasOperationPermission: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: TaskPermissionService, useValue: mockTaskPermissionService },
      ],
    }).compile();

    taskService = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
    taskPermissionService = module.get<TaskPermissionService>(
      TaskPermissionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasks', () => {
    it('should return the tasks when filterDto is empty', async () => {
      const mockUser = generateUserJWTPayload(UserType.USER);
      const filterDto = {} as GetTasksFilterDto;
      const mockTasks = generateTasks();
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
      expect(
        taskPermissionService.hasOperationPermission,
      ).toHaveBeenCalledTimes(0);
    });

    it('should return empty array when tasks matching filterDto is absent', async () => {
      const mockUser = generateUserJWTPayload(UserType.USER);
      const filterDto = {} as GetTasksFilterDto;
      mockPrismaService.task.findMany.mockResolvedValue([]);
      const result = await taskService.getTasks(mockUser, filterDto);
      expect(result).toEqual([]);
      expect(prismaService.task.findMany).toHaveBeenCalled();
      expect(
        taskPermissionService.hasOperationPermission,
      ).toHaveBeenCalledTimes(0);
    });
  });
});
