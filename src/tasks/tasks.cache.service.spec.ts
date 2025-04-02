import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { Task } from '@prisma/client';

import { RedisService } from '../redis/redis.service';
import { TaskCacheService } from './tasks.cache.service';

import { RedisServiceMock } from '../redis/__mock__/redis.service.mock';
import { PrismaTaskMock } from './__mock__/task-data.mock';

describe('', () => {
  let taskCacheService: TaskCacheService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskCacheService,
        { provide: RedisService, useValue: RedisServiceMock },
      ],
    }).compile();

    taskCacheService = module.get<TaskCacheService>(TaskCacheService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('getTaskFromCache', () => {
    it('should throw an Internal server exception when id is not provided', async () => {
      await expect(taskCacheService.getTaskFromCache(null)).rejects.toThrow(
        new InternalServerErrorException('task id is required'),
      );
    });
    it('should call redisService.get when id is provided', async () => {
      const task = PrismaTaskMock();
      RedisServiceMock.get.mockResolvedValue(JSON.stringify(task));
      await taskCacheService.getTaskFromCache(task.id);
      expect(redisService.get).toHaveBeenCalled();
    });
  });

  describe('setTaskInCache', () => {
    it('should throw an Internal server exception when task is not provided', async () => {
      await expect(taskCacheService.setTaskInCache({} as Task)).rejects.toThrow(
        new InternalServerErrorException('task data required'),
      );
    });
    it('should call redisService.set when id and task is provided', async () => {
      const task = PrismaTaskMock();
      RedisServiceMock.set.mockResolvedValue(true);
      await taskCacheService.setTaskInCache(task as Task);
      expect(redisService.set).toHaveBeenCalled();
    });
  });

  describe('deleteTaskFromCache', () => {
    it('should throw an Internal server exception when id is not provided', async () => {
      await expect(taskCacheService.deleteTaskFromCache(null)).rejects.toThrow(
        new InternalServerErrorException('task id is required'),
      );
    });
    it('should call redisService.deleteTaskFromCache when id is provided', async () => {
      const task = PrismaTaskMock();
      RedisServiceMock.set.mockResolvedValue(true);
      await taskCacheService.deleteTaskFromCache(task.id);
      expect(redisService.del).toHaveBeenCalled();
    });
  });
});
