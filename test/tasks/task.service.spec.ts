import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../../src/tasks/tasks.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { TaskPermissionService } from '../../src/helpers/task-permission-helper.service';

describe('TaskService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, PrismaService, TaskPermissionService],
    }).compile();
    service = module.get<TasksService>(TasksService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });
});
