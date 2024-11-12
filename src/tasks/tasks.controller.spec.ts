import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../../src/tasks/tasks.controller';
import { TasksService } from '../../src/tasks/tasks.service';
import { generateTask, generateTasks } from './__mock__/task-data.mock';
import { AuthGuard } from '../../src/auth/guards/auth.guard';
import { RolesGuard } from '../../src/auth/guards/roles.guard';
import { UserType } from '@prisma/client';
import { TaskResponseDto } from '../../src/tasks/dto/task.dto';
import { GetTasksFilterDto } from '../../src/tasks/dto/get-tasks-filter.dto';
import { TaskStatus } from '../../src/tasks/task.model';
import { CreateTaskDto } from '../../src/tasks/dto/create-task.dto';
import { TASK_RESPONSE_MESSAGE } from '../../src/utils/constants';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { TasksServiceMock } from './__mock__/tasks.service.mock';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: TasksServiceMock,
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

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  describe('getTasks', () => {
    it('should get all tasks', async () => {
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const tasks: TaskResponseDto[] = generateTasks(3);

      TasksServiceMock.getTasks.mockResolvedValue(tasks);
      const mockFilterDTO: GetTasksFilterDto = {
        status: TaskStatus.OPEN,
        search: 'hello',
      };
      const result = await controller.getTasks(
        mockFilterDTO,
        currentUserPayload,
      );
      expect(service.getTasks).toHaveBeenCalledWith(
        currentUserPayload,
        mockFilterDTO,
      );
      expect(result).toEqual(result);
    });
  });

  describe('getTaskById', () => {
    it('should return task based on the given ID', async () => {
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const task = generateTask();
      TasksServiceMock.getTaskById.mockResolvedValue(task);
      const result = await controller.getTaskById(task.id, currentUserPayload);
      expect(result).toEqual(task);
    });
  });

  describe('createTask', () => {
    it('should return the created task as a response', async () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentAdminUserPayload = mockTokenPayload(currentAdminUser);
      const task = generateTask();
      const { title, description, budget } = task;
      const body: CreateTaskDto = {
        title,
        description,
        budget,
      };
      TasksServiceMock.createTask.mockResolvedValue(task);
      const result = await controller.createTask(body, currentAdminUserPayload);
      expect(result).toEqual(task);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task that matches the taskId', async () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentAdminUserPayload = mockTokenPayload(currentAdminUser);
      const task = generateTask();
      TasksServiceMock.deleteTask.mockResolvedValue(
        TASK_RESPONSE_MESSAGE.DELETE_TASK,
      );
      const result = await controller.deleteTask(
        task.id,
        currentAdminUserPayload,
      );
      expect(result).toEqual(TASK_RESPONSE_MESSAGE.DELETE_TASK);
    });
  });

  describe('updateTask', () => {
    it('should return updated task when operation is successfull', async () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentAdminUserPayload = mockTokenPayload(currentAdminUser);
      const task = generateTask();
      const { title, description, budget } = task;
      const body: CreateTaskDto = {
        title,
        description,
        budget,
      };
      TasksServiceMock.updateTask.mockResolvedValue(task);
      const result = await controller.updateTask(
        task.id,
        body,
        currentAdminUserPayload,
      );
      expect(result).toEqual(task);
    });
  });

  describe('updateTaskStatus', () => {
    it('should return the updated task response', async () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentAdminUserPayload = mockTokenPayload(currentAdminUser);
      const task = generateTask();
      TasksServiceMock.updateTaskStatus.mockResolvedValue(task);
      const result = await controller.updateTaskStatus(
        task.id,
        TaskStatus.DONE,
        currentAdminUserPayload,
      );
      expect(result).toEqual(task);
    });
  });
});
