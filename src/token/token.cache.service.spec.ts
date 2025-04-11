import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../redis/redis.service';
import { RedisServiceMock } from '../redis/__mock__/redis.service.mock';
import { TokenCacheService } from './token.cache.service';
import { faker } from '@faker-js/faker/.';

describe('TokenCacheService', () => {
  let tokenCacheService: TokenCacheService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenCacheService,
        { provide: RedisService, useValue: RedisServiceMock },
      ],
    }).compile();
    tokenCacheService = module.get<TokenCacheService>(TokenCacheService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('setRefreshToken', () => {
    it('should call the redisService.set', async () => {
      const userId = faker.number.int();
      const token = faker.internet.jwt({ header: { alg: 'HS256' } });
      RedisServiceMock.set.mockResolvedValue('OK');
      await tokenCacheService.setRefreshToken(userId, token);
      expect(redisService.set).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRefreshToken', () => {
    it('should call redisService.get', async () => {
      const userId = faker.number.int();
      const token = faker.internet.jwt({ header: { alg: 'HS256' } });
      RedisServiceMock.get.mockResolvedValue(token);
      await tokenCacheService.getRefreshToken(userId);
      expect(redisService.get).toHaveBeenCalled();
    });
  });

  describe('deleteRefreshToken', () => {
    it('should call redisService.del', async () => {
      const userId = faker.number.int();
      RedisServiceMock.del.mockResolvedValue('OK');
      await tokenCacheService.deleteRefreshToken(userId);
      expect(redisService.del).toHaveBeenCalled();
    });
  });
});
