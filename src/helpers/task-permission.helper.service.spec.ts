import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UserType } from '@prisma/client';

import { TaskPermissionService } from '../../src/helpers/task-permission.helper.service';

import { ERROR_NAME, RESPONSE_MESSAGE } from '../../src/utils/constants';

import { TaskResponseDto } from '../../src/tasks/dto/task.dto';

import { generateTask } from '../tasks/__mock__/task-data.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { faker } from '@faker-js/faker/.';

describe('TaskPermissionService', () => {
  let service: TaskPermissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskPermissionService],
    }).compile();

    service = module.get<TaskPermissionService>(TaskPermissionService);
  });

  describe('hasTaskCreationPermission', () => {
    it('should return true when user is Super', () => {
      const currentSuperUser = { ...mockUser(), userType: UserType.SUPER };
      const currentUserPayload = mockTokenPayload(currentSuperUser);

      const task: TaskResponseDto = generateTask();

      const result = service.hasTaskCreationPermission(
        currentUserPayload,
        task.enterpriseId,
      );

      expect(result).toBeTruthy();
    });
    it('should allow admin user and the enterprise', () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentUserPayload = mockTokenPayload(currentAdminUser);
      const enterperiseId = faker.number.int({ min: 1 });

      const result = service.hasTaskCreationPermission(
        {
          ...currentUserPayload,
          companionOf: [
            ...currentUserPayload.companionOf,
            { id: enterperiseId },
          ],
        },
        enterperiseId,
      );

      expect(result).toBe(true);
    });
    it('should raise permission denied error when user does not belong to an enterprise', () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentUserPayload = mockTokenPayload(currentAdminUser);
      const enterperiseId = faker.number.int({ min: 1 });

      expect(() =>
        service.hasTaskCreationPermission(currentUserPayload, enterperiseId),
      ).toThrow(
        new ForbiddenException(
          RESPONSE_MESSAGE.PERMISSION_DENIED,
          ERROR_NAME.PERMISSION_DENIED,
        ),
      );
    });
  });

  describe('hasOperationPermission', () => {
    it('should allow super user to perform operation', () => {
      const currentSuperUser = { ...mockUser(), userType: UserType.SUPER };
      const currentUserPayload = mockTokenPayload(currentSuperUser);

      const task: TaskResponseDto = generateTask();

      const result = service.hasOperationPermission(currentUserPayload, task);

      expect(result).toBe(true);
    });

    it('should allow ADMIN user who created task to perform operation', () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentUserPayload = mockTokenPayload(currentAdminUser);

      const task: TaskResponseDto = generateTask();

      const result = service.hasOperationPermission(currentUserPayload, {
        ...task,
        creatorId: currentAdminUser.id,
      });

      expect(result).toBe(true);
    });

    it('should not allow ADMIN user who is not the creator of the task by throwing ForbiddenException', () => {
      const currentAdminUser = { ...mockUser(), userType: UserType.ADMIN };
      const currentUserPayload = mockTokenPayload(currentAdminUser);

      const task: TaskResponseDto = generateTask();

      expect(() =>
        service.hasOperationPermission(currentUserPayload, task),
      ).toThrow(
        new ForbiddenException(
          RESPONSE_MESSAGE.PERMISSION_DENIED,
          ERROR_NAME.PERMISSION_DENIED,
        ),
      );
    });

    it('should deny permission for USER role accessor', () => {
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const task: TaskResponseDto = generateTask();

      expect(() =>
        service.hasOperationPermission(currentUserPayload, task),
      ).toThrow(ForbiddenException);
      expect(() =>
        service.hasOperationPermission(currentUserPayload, task),
      ).toThrow(
        new ForbiddenException(
          RESPONSE_MESSAGE.PERMISSION_DENIED,
          ERROR_NAME.PERMISSION_DENIED,
        ),
      );
    });
  });
});
