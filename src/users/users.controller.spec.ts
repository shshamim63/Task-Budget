import { Test, TestingModule } from '@nestjs/testing';
import { UsersServiceMock } from './__mock__/users.service.mock';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { UsersController } from './users.controller';
import {
  UpdateUserPasswordPayloadMock,
  UpdateUserPayloadMock,
} from './__mock__/user-data.mock';
import { UserResponseDto } from '../auth/dto/user.dto';
import { USER_RESPONSE_MESSAGE } from '../utils/constants';
import { faker } from '@faker-js/faker/.';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: UsersService, useValue: UsersServiceMock }],
      controllers: [UsersController],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActive: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should call the getProfile service method and return the response', async () => {
      const currentUser = mockUser();
      const currentPayload = mockTokenPayload(currentUser);

      UsersServiceMock.getProfile.mockResolvedValue(currentUser);

      const response = await controller.getProfile(currentPayload);
      expect(response).toMatchObject(currentUser);
      expect(usersService.getProfile).toHaveBeenCalledWith(currentPayload);
    });
  });

  describe('activateUserAccount', () => {
    it('should call the usersService.accountActivation function successfully', async () => {
      const id = faker.number.int();

      UsersServiceMock.accountActivation.mockResolvedValue(true);
      await controller.activateUserAccount(id);
      expect(usersService.accountActivation).toHaveBeenCalled();
    });
  });
  describe('updateUserProfile', () => {
    it('should call userService.updateUserProfile and return the response as the UserResponse', async () => {
      const currentUser = mockUser();
      const currentUserJWTPayload = mockTokenPayload(currentUser);
      const { data: updateUserPayload } = UpdateUserPayloadMock();

      UsersServiceMock.updateUserProfile.mockResolvedValue(currentUser);
      const response = await controller.updateUserProfile(
        currentUserJWTPayload,
        updateUserPayload,
        currentUser.id,
      );

      expect(response).toMatchObject(new UserResponseDto(currentUser));
    });
  });

  describe('updateUserPassword', () => {
    it('should call userService.updateUserPassword and return success message', async () => {
      const currentUser = mockUser();
      const currentUserJWTPayload = mockTokenPayload(currentUser);
      const updateUserpasswordPayload = UpdateUserPasswordPayloadMock();

      UsersServiceMock.updateUserPassword.mockResolvedValue(
        USER_RESPONSE_MESSAGE.UPDATE_PASSWORD,
      );
      const response = await controller.updateUserPassword(
        currentUser.id,
        updateUserpasswordPayload,
        currentUserJWTPayload,
      );

      expect(response).toEqual(USER_RESPONSE_MESSAGE.UPDATE_PASSWORD);
    });
  });
});
