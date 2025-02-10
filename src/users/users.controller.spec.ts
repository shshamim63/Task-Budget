import { Test, TestingModule } from '@nestjs/testing';
import { UsersServiceMock } from './__mock__/users.service.mock';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { mockUser } from '../auth/__mock__/auth-data.mock';
import { mockTokenPayload } from '../token/__mock__/token-data.mock';
import { UsersController } from './users.controller';

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
});
