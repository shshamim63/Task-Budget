import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const Task = createParamDecorator((data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.task;
});
