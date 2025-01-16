import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { TaskInterceptor } from './task.interceptor';
import { TaskRepositoryMock } from '../__mock__/task.repository.mock';
import { ErrorHandlerService } from '../../helpers/error.helper.service';
import { TaskResponseDto } from '../dto/task.dto';
import { faker } from '@faker-js/faker/.';
import { generateRedisMockKey } from '../__mock__/task-data.mock';

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
      mockErrorHandlerService as ErrorHandlerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should attach the task to the request when successful', async () => {
    const taskMock = {
      id: mockTaskId,
      title: 'Sample Task',
    };

    const redisTaskKey = generateRedisMockKey(mockTaskId);

    TaskRepositoryMock.findUniqueOrThrow.mockResolvedValue(taskMock);

    const result = await interceptor.intercept(
      mockContext as ExecutionContext,
      mockNext as CallHandler,
    );

    const request = mockContext.switchToHttp().getRequest();

    expect(TaskRepositoryMock.findUniqueOrThrow).toHaveBeenCalledWith({
      redisKey: redisTaskKey,
      query: {
        where: { id: mockTaskId },
      },
    });
    expect(request.task).toEqual(new TaskResponseDto(taskMock));
    const emittedValue = await firstValueFrom(result);
    expect(emittedValue).toBe('nextHandlerResult');
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Task not found');
    TaskRepositoryMock.findUniqueOrThrow.mockRejectedValue(error);
    const redisTaskKey = generateRedisMockKey(mockTaskId);
    await expect(
      interceptor.intercept(
        mockContext as ExecutionContext,
        mockNext as CallHandler,
      ),
    ).rejects.toThrow(error);

    expect(TaskRepositoryMock.findUniqueOrThrow).toHaveBeenCalledWith({
      redisKey: redisTaskKey,
      query: {
        where: { id: mockTaskId },
      },
    });
    expect(mockErrorHandlerService.handle).toHaveBeenCalledWith(error);
  });
});
