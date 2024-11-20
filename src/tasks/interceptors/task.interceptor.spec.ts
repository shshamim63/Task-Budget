import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { TaskInterceptor } from './task.interceptor';
import { TaskRepositoryMock } from '../__mock__/task.repository.mock';
import { ErrorHandlerService } from '../../helpers/error.helper.service';
import { TaskResponseDto } from '../dto/task.dto';

describe('TaskInterceptor', () => {
  let interceptor: TaskInterceptor;
  let mockErrorHandlerService: Partial<ErrorHandlerService>;
  let mockContext: Partial<ExecutionContext>;
  let mockNext: Partial<CallHandler>;

  beforeEach(() => {
    mockErrorHandlerService = {
      handle: jest.fn((error: Error) => {
        throw error;
      }),
    };

    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          params: { taskId: '1' },
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
    const taskMock = { id: 1, title: 'Sample Task' };
    TaskRepositoryMock.findUniqueOrThrow.mockResolvedValue(taskMock);

    const result = await interceptor.intercept(
      mockContext as ExecutionContext,
      mockNext as CallHandler,
    );

    const request = mockContext.switchToHttp().getRequest();
    expect(TaskRepositoryMock.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(request.task).toEqual(new TaskResponseDto(taskMock));
    const emittedValue = await firstValueFrom(result);
    expect(emittedValue).toBe('nextHandlerResult');
  });
});
