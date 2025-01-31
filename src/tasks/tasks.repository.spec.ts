import { Test, TestingModule } from '@nestjs/testing';
import { TaskRepository } from './tasks.repository';
import { RedisService } from '../redis/redis.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { RedisServiceMock } from '../redis/__mock__/redis.service.mock';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';
import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';
import { faker } from '@faker-js/faker/.';
import { Prisma, TaskStatus } from '@prisma/client';
import { generateTask } from './__mock__/task-data.mock';

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

  afterEach(() => {
    jest.clearAllMocks();
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

  describe('findUniqueOrThrow', () => {
    it('should call redisService.get method should not call asyncErrorHandlerService.execute and prismaService.task.findUniqueOrThrow method', async () => {
      const query = {
        where: { id: faker.number.int() },
      } as Prisma.TaskFindUniqueOrThrowArgs;
      const redisKey = faker.word.adverb();
      const task = JSON.stringify(generateTask());
      RedisServiceMock.get.mockResolvedValue(task);

      await repository.findUniqueOrThrow({ redisKey, query });

      expect(redisService.get).toHaveBeenCalledWith(redisKey);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalledTimes(0);
      expect(prismaService.task.findUniqueOrThrow).toHaveBeenCalledTimes(0);
    });
    it('should call asyncErrorHandlerService.execute and prismaService.task.findUniqueOrThrow method', async () => {
      const query = {
        where: { id: faker.number.int() },
      } as Prisma.TaskFindUniqueOrThrowArgs;

      PrismaServiceMock.task.findUniqueOrThrow.mockResolvedValue(true);
      await repository.findUniqueOrThrow({ query });
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.task.findUniqueOrThrow).toHaveBeenCalledWith(query);
    });
  });

  describe('findMany', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.task.findMany method', async () => {
      const query = {
        where: { id: faker.number.int() },
      } as Prisma.TaskFindManyArgs;

      PrismaServiceMock.task.findMany.mockResolvedValue(true);
      await repository.findMany(query);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.task.findMany).toHaveBeenCalledWith(query);
    });
  });

  describe('create', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.task.create method', async () => {
      const payload = {
        title: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
        status: TaskStatus.OPEN,
        creatorId: faker.number.int(),
        enterpriseId: faker.number.int(),
        budget: new Prisma.Decimal(
          faker.number.float({ min: 10, fractionDigits: 2, max: 30 }),
        ),
      };

      PrismaServiceMock.task.create.mockResolvedValue(true);
      await repository.create({ data: payload });
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.task.create).toHaveBeenCalledWith({ data: payload });
    });
  });

  describe('delete', () => {
    it('should call asyncErrorHandlerService.execute and prismaService.task.delete method', async () => {
      const redisKey = faker.word.adverb();
      const query = { where: { id: faker.number.int() } };

      PrismaServiceMock.task.delete.mockResolvedValue(true);
      await repository.delete({ redisKey, query });
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
      expect(prismaService.task.delete).toHaveBeenCalledWith(query);
    });
  });
});
