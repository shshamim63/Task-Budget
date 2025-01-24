import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { TaskResponseDto } from '../dto/task.dto';
import { ErrorHandlerService } from '../../helpers/error.helper.service';
import { TaskRepository } from '../tasks.repository';
import { TaskQuery } from '../interface/task-response.interface';
import { REDIS_KEYS_FOR_TASK } from '../../utils/redis-keys';

@Injectable()
export class TaskInterceptor implements NestInterceptor {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const taskId = request.params.taskId;

    try {
      const redisKey = `${REDIS_KEYS_FOR_TASK.TASK_WITH_ID}-${taskId}`;

      const query: TaskQuery = {
        where: { id: Number(taskId) },
      };

      const task = await this.taskRepository.findUniqueOrThrow({
        redisKey,
        query,
      });

      request.task = new TaskResponseDto(task);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }

    return next.handle();
  }
}
