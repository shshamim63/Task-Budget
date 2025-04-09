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

import { Prisma, Task } from '@prisma/client';
import { TaskCacheService } from '../tasks.cache.service';

@Injectable()
export class TaskInterceptor implements NestInterceptor {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly taskCacheService: TaskCacheService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const taskId = request.params.taskId;

    try {
      const query: Prisma.TaskFindUniqueOrThrowArgs = {
        where: { id: Number(taskId) },
      };

      let task: Task;

      task = await this.taskCacheService.getTaskFromCache(taskId);

      if (!task) {
        task = await this.taskRepository.findUniqueOrThrow(query);
      }

      request.task = new TaskResponseDto(task);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }

    return next.handle();
  }
}
