import { Test, TestingModule } from '@nestjs/testing';
import { TaskPermissionService } from '../../src/helpers/task-permission-helper.service';
import { JWTPayload } from '../../src/auth/interfaces/auth.interface';
import { generateUserJWTPayload } from '../test-seed/auth.helpers';
import { TaskResponseDto } from '../../src/tasks/dto/task.dto';
import { generateTask } from '../test-seed/task.helpers';
import { UserType } from '@prisma/client';

describe('TaskPermissionService', () => {
  let service: TaskPermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskPermissionService],
    }).compile();

    service = module.get<TaskPermissionService>(TaskPermissionService);
  });

  it('should allow super user to perform operation', () => {
    const user: JWTPayload = generateUserJWTPayload(UserType.SUPER);
    const task: TaskResponseDto = generateTask();

    const result = service.hasOperationPermission(user, task);
    expect(result).toBe(true);
  });
});
