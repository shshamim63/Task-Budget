import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get } from '@nestjs/common';

import { Task } from './task.decorator';
import { TaskResponseDto } from '../dto/task.dto';

import { generateTask } from '../__mock__/task-data.mock';

@Controller('task')
class TaskController {
  @Get()
  getTask(@Task() task: TaskResponseDto) {
    return task;
  }
}

describe('Task Decorator', () => {
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
    }).compile();
    controller = module.get<TaskController>(TaskController);
  });

  it('should return the task from the request', () => {
    const task = generateTask();
    const taskFromDecorator = controller.getTask(task);
    expect(taskFromDecorator).toMatchObject(task);
  });
});
