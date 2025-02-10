import { Test, TestingModule } from '@nestjs/testing';

import { UserRepository } from './user.repository';
import { UserRepositoryMock } from './__mock__/user.repository.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: UserRepositoryMock },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    service = module.get<UsersService>(UsersService);
  });

  describe('getProfile', () => {
    it('should call userRespository.findUnique method with the given query', async () => {
      const currentUser = mockUser();
      const currentPayload = mockTokenPayload(currentUser);

      UserRepositoryMock.findUnique.mockResolvedValue(currentPayload);

      await service.getProfile(currentPayload);

      const query = { where: { id: currentPayload.id } };
      expect(userRepository.findUnique).toHaveBeenCalledWith(query);
    });
  });
});
