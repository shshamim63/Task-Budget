import { Test, TestingModule } from '@nestjs/testing';
import { TaskRepository } from './tasks.repository';
import { RedisService } from '../redis/redis.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { RedisServiceMock } from '../redis/__mock__/redis.service.mock';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';
import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';
import { faker } from '@faker-js/faker/.';

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let prismaService: PrismaService;
  let redisService: RedisService;
  let asyncErrorHandlerService: AsyncErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskRepository,
        { provide: RedisService, useValue: RedisServiceMock },
        { provide: PrismaService, useValue: PrismaServiceMock },
        {
          provide: AsyncErrorHandlerService,
          useValue: AsyncErrorHandlerServiceMock,
        },
      ],
    }).compile();
    repository = module.get<TaskRepository>(TaskRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);
    asyncErrorHandlerService = module.get<AsyncErrorHandlerService>(
      AsyncErrorHandlerService,
    );
  });
  describe('findFirst', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.task.findUnique method', async () => {
      const query = {
        where: { id: faker.number.int() },
      };
      PrismaServiceMock.task.findFirst.mockResolvedValue(true);
      await repository.findFirst(query);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.task.findFirst).toHaveBeenCalledWith(query);
    });
  });

  describe('findUnique', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.task.findUnique method', async () => {
      const query = {
        where: { id: faker.number.int() },
      };
      PrismaServiceMock.task.findUnique.mockResolvedValue(true);
      await repository.findUnique(query);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.task.findUnique).toHaveBeenCalledWith(query);
    });
  });
});
