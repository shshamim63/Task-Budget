import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Observable } from 'rxjs';

@Injectable()
export class TaskInterceptor implements NestInterceptor {
  constructor(private readonly prismaService: PrismaService) {}

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

      request.task = task;
    } catch (error) {
      console.error(error);
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return next.handle();
  }
}
