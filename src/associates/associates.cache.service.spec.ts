import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../redis/redis.service';
import { RedisServiceMock } from '../redis/__mock__/redis.service.mock';
import { AssociateCacheService } from './associates.cache.service';
import { faker } from '@faker-js/faker/.';
import { generateUserAffiliatedTo } from './__mock__/associate-data.mock';

describe('AssociateCacheService', () => {
  let associateCacheService: AssociateCacheService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociateCacheService,
        { provide: RedisService, useValue: RedisServiceMock },
      ],
    }).compile();
    associateCacheService = module.get<AssociateCacheService>(
      AssociateCacheService,
    );
    redisService = module.get<RedisService>(RedisService);
  });

  describe('getAssociatesToFromCache', () => {
    it('should return null when data is missing', async () => {
      const id = faker.number.int();
      RedisServiceMock.get.mockResolvedValue(null);
      const result = await associateCacheService.getAssociatesToFromCache(id);
      expect(result).toEqual(null);
    });
    it('should return affiliateTo json format data', async () => {
      const userId = faker.number.int();
      const numOfRecords = faker.number.int({ min: 1, max: 5 });
      const associates = generateUserAffiliatedTo({ userId, numOfRecords });
      RedisServiceMock.get.mockResolvedValue(JSON.stringify(associates));

      const result =
        await associateCacheService.getAssociatesToFromCache(userId);

      expect(result.length).toEqual(associates.length);
      expect(redisService.get).toHaveBeenCalled();
    });
  });

  describe('setAssociatesToFromCache', () => {
    it('should return call redisService.set', async () => {
      const userId = faker.number.int();
      const numOfRecords = faker.number.int({ min: 1, max: 5 });
      const associates = generateUserAffiliatedTo({ userId, numOfRecords });
      RedisServiceMock.set.mockResolvedValue('OK');

      await associateCacheService.setAssociatesToFromCache(userId, associates);

      expect(redisService.set).toHaveBeenCalled();
    });
  });
});
