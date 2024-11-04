import { Test, TestingModule } from '@nestjs/testing';
import { TaskPermissionService } from '../../src/helpers/task-permission.helper.service';
import { JWTPayload } from '../../src/auth/interfaces/auth.interface';
import { generateUserJWTPayload } from '../mock-data/auth.mock';
import { TaskResponseDto } from '../../src/tasks/dto/task.dto';
import { generateTask } from '../mock-data/task.mock';
import { UserType } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../../src/utils/constants';

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

  it('should allow ADMIN user who created task to perform operation', () => {
    const user: JWTPayload = generateUserJWTPayload(UserType.ADMIN);
    const task: TaskResponseDto = generateTask();

    const result = service.hasOperationPermission(user, {
      ...task,
      creatorId: user.id,
    });

    expect(result).toBe(true);
  });

  it('should not allow ADMIN user who is not the creator of the task by throwing ForbiddenException', () => {
    const user: JWTPayload = generateUserJWTPayload(UserType.ADMIN);
    const task: TaskResponseDto = generateTask();
    expect(() => service.hasOperationPermission(user, task)).toThrow(
      ForbiddenException,
    );
    expect(() => service.hasOperationPermission(user, task)).toThrow(
      new ForbiddenException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      ),
    );
  });

  it('should drny permission for USER role accessor', () => {
    const user: JWTPayload = generateUserJWTPayload(UserType.USER);
    const task: TaskResponseDto = generateTask();

    expect(() => service.hasOperationPermission(user, task)).toThrow(
      ForbiddenException,
    );
    expect(() => service.hasOperationPermission(user, task)).toThrow(
      new ForbiddenException(
        RESPONSE_MESSAGE.PERMISSION_DENIED,
        ERROR_NAME.PERMISSION_DENIED,
      ),
    );
  });
});
