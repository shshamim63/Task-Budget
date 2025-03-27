import { Test, TestingModule } from '@nestjs/testing';

import { UserRepository } from './user.repository';
import { UserRepositoryMock } from './__mock__/user.repository.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { UsersService } from './users.service';
import { UpdateUserPayloadMock } from './__mock__/user-data.mock';
import { faker } from '@faker-js/faker/.';
import { RESPONSE_MESSAGE } from '../utils/constants';
import { ForbiddenException } from '@nestjs/common';

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

  describe('updateUserProfile', () => {
    it('should call userRespository.update method with the given payload ', async () => {
      const currentUser = mockUser();
      const currentPayload = mockTokenPayload(currentUser);
      const { data: updateUserPayload } = UpdateUserPayloadMock();

      UserRepositoryMock.update.mockResolvedValue(currentUser);

      await service.updateUserProfile(
        updateUserPayload,
        currentPayload,
        currentPayload.id,
      );
      expect(userRepository.update).toHaveBeenCalledWith({
        where: { id: currentUser.id },
        data: updateUserPayload,
      });
    });
    it('should thorw error when id and current user id is not the same', async () => {
      const invalidUserId = faker.number.int();
      const currentUser = mockUser();
      const currentPayload = mockTokenPayload(currentUser);
      const { data: updateUserPayload } = UpdateUserPayloadMock();

      await expect(
        service.updateUserProfile(
          updateUserPayload,
          currentPayload,
          invalidUserId,
        ),
      ).rejects.toThrow(
        new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED),
      );
    });
  });
});
