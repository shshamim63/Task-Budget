import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { faker } from '@faker-js/faker/.';
import * as bcrypt from 'bcrypt';

import { UsersService } from './users.service';
import { UserRepository } from './user.repository';
import { RESPONSE_MESSAGE, USER_RESPONSE_MESSAGE } from '../utils/constants';

import { UserRepositoryMock } from './__mock__/user.repository.mock';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import {
  UpdateUserPasswordPayloadMock,
  UpdateUserPayloadMock,
} from './__mock__/user-data.mock';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
  let compareSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: UserRepositoryMock },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    service = module.get<UsersService>(UsersService);
    compareSpy = jest.spyOn(bcrypt, 'compare');
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

  describe('updateUserPassword', () => {
    it('should throw ForbiddenException when current user id and updated user id is not same', async () => {
      const invalidUserId = faker.number.int();
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const upadtePasswordRequestBody = UpdateUserPasswordPayloadMock();

      await expect(
        service.updateUserPassword(
          invalidUserId,
          currentUserPayload,
          upadtePasswordRequestBody,
        ),
      ).rejects.toThrow(
        new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED),
      );
    });
    it('should throw ForbiddenException when current user is missing in the database', async () => {
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const upadtePasswordRequestBody = UpdateUserPasswordPayloadMock();

      UserRepositoryMock.findUnique.mockResolvedValue(false);

      await expect(
        service.updateUserPassword(
          currentUserPayload.id,
          currentUserPayload,
          upadtePasswordRequestBody,
        ),
      ).rejects.toThrow(
        new ForbiddenException(RESPONSE_MESSAGE.PERMISSION_DENIED),
      );
    });
    it('should throw UnauthorizedException when currentPassword is invalid', async () => {
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const upadtePasswordRequestBody = UpdateUserPasswordPayloadMock();

      UserRepositoryMock.findUnique.mockResolvedValue(currentUser);
      compareSpy.mockResolvedValue(false);

      await expect(
        service.updateUserPassword(
          currentUserPayload.id,
          currentUserPayload,
          upadtePasswordRequestBody,
        ),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });
    it('should return success response when all the data is valid', async () => {
      const currentUser = mockUser();
      const currentUserPayload = mockTokenPayload(currentUser);
      const upadtePasswordRequestBody = UpdateUserPasswordPayloadMock();

      UserRepositoryMock.findUnique.mockResolvedValue(currentUser);
      compareSpy.mockResolvedValue(true);
      UserRepositoryMock.update.mockResolvedValue(true);

      const result = await service.updateUserPassword(
        currentUserPayload.id,
        currentUserPayload,
        upadtePasswordRequestBody,
      );

      expect(result).toEqual(USER_RESPONSE_MESSAGE.UPDATE_PASSWORD);
    });
  });
});
