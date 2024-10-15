import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../../src/tasks/tasks.controller';
import { TasksService } from '../../src/tasks/tasks.service';
import { generateTask, generateTasks } from '../helpers/task.helpers';
import { AuthGuard } from '../../src/auth/guards/auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { generateUserJWTPayload } from '../helpers/auth.helpers';
import { UserType } from '@prisma/client';
import { TaskResponseDto } from '../../src/tasks/dto/task.dto';
import { GetTasksFilterDto } from '../../src/tasks/dto/get-tasks-filter.dto';
import { TaskStatus } from '../../src/tasks/task.model';

const mockTasksService = {
  getTasks: jest.fn(), // Ensure it's a mock function
  getTaskById: jest.fn(), // Same here
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
});
