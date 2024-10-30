import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../../src/tasks/tasks.controller';
import { TasksService } from '../../src/tasks/tasks.service';
import { generateTask, generateTasks } from '../test-seed/task.helpers';
import { AuthGuard } from '../../src/auth/guards/auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { generateUserJWTPayload } from '../test-seed/auth.helpers';
import { UserType } from '@prisma/client';
import { TaskResponseDto } from '../../src/tasks/dto/task.dto';
import { GetTasksFilterDto } from '../../src/tasks/dto/get-tasks-filter.dto';
import { TaskStatus } from '../../src/tasks/task.model';
import { CreateTaskDto } from '../../src/tasks/dto/create-task.dto';
import { TASK_RESPONSE_MESSAGE } from '../../src/utils/constants';

const mockTasksService = {
  getTasks: jest.fn(),
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  updateTask: jest.fn(),
  updateTaskStatus: jest.fn(),
};

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: TasksService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActive: jest.fn(() => true),
      })
      .compile();

    tasksController = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
  });

  describe('getTasks', () => {
    it('should get all tasks', async () => {
      const tasks: TaskResponseDto[] = generateTasks(3);
      const mockUserPayload = generateUserJWTPayload(UserType.USER);
      mockTasksService.getTasks.mockResolvedValue(tasks);
      const mockFilterDTO: GetTasksFilterDto = {
        status: TaskStatus.OPEN,
        search: 'hello',
      };
      const result = await tasksController.getTasks(
        mockFilterDTO,
        mockUserPayload,
      );
      expect(tasksService.getTasks).toHaveBeenCalledWith(
        mockUserPayload,
        mockFilterDTO,
      );
      expect(result).toEqual(result);
    });
  });

  describe('getTaskById', () => {
    it('should return task based on the given ID', async () => {
      const mockTask = generateTask();
      const mockUser = generateUserJWTPayload(UserType.USER);
      mockTasksService.getTaskById.mockResolvedValue(mockTask);
      const result = await tasksController.getTaskById(mockTask.id, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('createTask', () => {
    it('should return the created task as a response', async () => {
      const mockTask = generateTask();
      const mockUser = generateUserJWTPayload(UserType.ADMIN);
      const { title, description, budget } = mockTask;
      const body: CreateTaskDto = {
        title,
        description,
        budget,
      };
      mockTasksService.createTask.mockResolvedValue(mockTask);
      const result = await tasksController.createTask(body, mockUser);
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task that matches the taskId', async () => {
      const mockTask = generateTask();
      const mockUser = generateUserJWTPayload(UserType.ADMIN);
      mockTasksService.deleteTask.mockResolvedValue(
        TASK_RESPONSE_MESSAGE.DELETE_TASK,
      );
      const result = await tasksController.deleteTask(mockTask.id, mockUser);
      expect(result).toEqual(TASK_RESPONSE_MESSAGE.DELETE_TASK);
    });
  });

  describe('updateTask', () => {
    it('should return updated task when operation is successfull', async () => {
      const mockTask = generateTask();
      const mockUser = generateUserJWTPayload(UserType.ADMIN);
      const { title, description, budget } = mockTask;
      const body: CreateTaskDto = {
        title,
        description,
        budget,
      };
      mockTasksService.updateTask.mockResolvedValue(mockTask);
      const result = await tasksController.updateTask(
        mockTask.id,
        body,
        mockUser,
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTaskStatus', () => {
    it('should return the updated task response', async () => {
      const mockTask = generateTask();
      const mockUser = generateUserJWTPayload(UserType.ADMIN);
      mockTasksService.updateTaskStatus.mockResolvedValue(mockTask);
      const result = await tasksController.updateTaskStatus(
        mockTask.id,
        TaskStatus.DONE,
        mockUser,
      );
      expect(result).toEqual(mockTask);
    });
  });
});
