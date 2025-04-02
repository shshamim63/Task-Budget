import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { faker } from '@faker-js/faker/.';

import { TaskInterceptor } from './task.interceptor';

import { ErrorHandlerService } from '../../helpers/error.helper.service';

import { TaskResponseDto } from '../dto/task.dto';

import { TaskRepositoryMock } from '../__mock__/task.repository.mock';

import { TaskCacheServiceMock } from '../__mock__/tasks.cache.service.mock';

describe('TaskInterceptor', () => {
  let interceptor: TaskInterceptor;
  let mockErrorHandlerService: Partial<ErrorHandlerService>;
  let mockContext: Partial<ExecutionContext>;
  let mockNext: Partial<CallHandler>;
  const mockTaskId = faker.number.int({ min: 1, max: 10 });

  beforeEach(() => {
    mockErrorHandlerService = {
      handle: jest.fn((error: Error) => {
        throw error;
      }),
    };

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          params: { taskId: mockTaskId.toString() },
        }),
      }),
    };

    mockNext = {
      handle: jest.fn().mockReturnValue(of('nextHandlerResult')),
    };

    interceptor = new TaskInterceptor(
      TaskRepositoryMock as any,
      TaskCacheServiceMock as any,
      mockErrorHandlerService as ErrorHandlerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not call taskRepository.findUniqueOrThrow when redis have cache value', async () => {
    const taskMock = {
      id: mockTaskId,
      title: 'Sample Task',
    };

    TaskCacheServiceMock.getTaskFromCache.mockResolvedValue(taskMock);

    const result = await interceptor.intercept(
      mockContext as ExecutionContext,
      mockNext as CallHandler,
    );

    const request = mockContext.switchToHttp().getRequest();

    expect(TaskRepositoryMock.findUniqueOrThrow).toHaveBeenCalledTimes(0);

    expect(request.task).toEqual(new TaskResponseDto(taskMock));
    const emittedValue = await firstValueFrom(result);
    expect(emittedValue).toBe('nextHandlerResult');
  });

  it('should call taskRepository.findUniqueOrThrow when redis does not have cache', async () => {
    const taskMock = {
      id: mockTaskId,
      title: 'Sample Task',
    };

    TaskCacheServiceMock.getTaskFromCache.mockResolvedValue(null);
    TaskRepositoryMock.findUniqueOrThrow.mockResolvedValue(taskMock);

    const result = await interceptor.intercept(
      mockContext as ExecutionContext,
      mockNext as CallHandler,
    );

    const request = mockContext.switchToHttp().getRequest();

    expect(TaskRepositoryMock.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: mockTaskId },
    });

    expect(request.task).toEqual(new TaskResponseDto(taskMock));
    const emittedValue = await firstValueFrom(result);
    expect(emittedValue).toBe('nextHandlerResult');
  });
  it('should handle errors gracefully', async () => {
    const error = new Error('Task not found');

    TaskCacheServiceMock.getTaskFromCache.mockResolvedValue(null);
    TaskRepositoryMock.findUniqueOrThrow.mockRejectedValue(error);

    await expect(
      interceptor.intercept(
        mockContext as ExecutionContext,
        mockNext as CallHandler,
      ),
    ).rejects.toThrow(error);

    expect(TaskRepositoryMock.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: mockTaskId },
    });
    expect(mockErrorHandlerService.handle).toHaveBeenCalledWith(error);
  });
});
