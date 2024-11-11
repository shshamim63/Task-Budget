import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get } from '@nestjs/common';

import { User } from './user.decorator';

@Controller('test')
class TestController {
  @Get()
  getUser(@User() user: any) {
    return user;
  }
}

describe('User Decorator', () => {
  let controller: TestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    controller = module.get<TestController>(TestController);
  });

  it('should return the user from the request', () => {
    const mockUser = { id: 1, name: 'John Doe' };

    const mockRequest = {
      user: mockUser,
    };

    const userFromDecorator = controller.getUser(mockRequest.user);

    expect(userFromDecorator).toEqual(mockUser);
  });
});
