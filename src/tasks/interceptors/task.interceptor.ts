import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Observable } from 'rxjs';
import { TaskResponseDto } from '../dto/task.dto';
import { ErrorHandlerService } from '../../helpers/error.helper.service';

@Injectable()
export class TaskInterceptor implements NestInterceptor {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly errorHandlerService: ErrorHandlerService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const taskId = request.params.taskId;

    try {
      const task = await this.prismaService.task.findUniqueOrThrow({
        where: { id: Number(taskId) },
      });

      request.task = new TaskResponseDto(task);
    } catch (error) {
      this.errorHandlerService.handle(error);
    }

    return next.handle();
  }
}
