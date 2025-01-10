import { Test, TestingModule } from '@nestjs/testing';

import Redis from 'ioredis';

import { faker } from '@faker-js/faker/.';

import { RedisService } from './redis.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';

import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';
import { RedisServiceMock } from './__mock__/redis.service.mock';

jest.mock('ioredis');

describe('RedisService', () => {
  let redisService: RedisService;
  let asyncErrorHandlerService: AsyncErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: 'default_IORedisModuleConnectionToken',
          useValue: RedisServiceMock,
        },
        {
          provide: AsyncErrorHandlerService,
          useValue: AsyncErrorHandlerServiceMock,
        },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    asyncErrorHandlerService = module.get<AsyncErrorHandlerService>(
      AsyncErrorHandlerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set a key with TTL in Redis', async () => {
    RedisServiceMock.set.mockResolvedValue('OK');
    const key = faker.word.noun();
    const value = faker.string.hexadecimal();
    const ttl = faker.number.int({ min: 10, max: 100 });

    await redisService.set(key, value, ttl);

    expect(asyncErrorHandlerService.execute).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(RedisServiceMock.set).toHaveBeenCalledWith(key, value, 'EX', ttl);
  });

  it('should get a value with key in Redis', async () => {
    const key = faker.word.noun();
    const value = faker.string.hexadecimal();

    RedisServiceMock.get.mockResolvedValue(value);

    await redisService.get(key);

    expect(asyncErrorHandlerService.execute).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(RedisServiceMock.get).toHaveBeenCalledWith(key);
  });

  it('should del a field-value pair in Redis', async () => {
    const key = faker.word.noun();

    RedisServiceMock.del.mockResolvedValue(1);

    await redisService.del(key);

    expect(asyncErrorHandlerService.execute).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(RedisServiceMock.del).toHaveBeenCalledWith(key);
  });

  it('should return boolean value when a field-value pair exists in Redis', async () => {
    const key = faker.word.noun();

    RedisServiceMock.exists.mockResolvedValue(true);

    await redisService.exists(key);

    expect(asyncErrorHandlerService.execute).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(RedisServiceMock.exists).toHaveBeenCalledWith(key);
  });
});
