import { UserResponseDto } from '../dto/user.dto';
import { mockAuthenticatedUser } from './auth-data.mock';

export const AuthServiceMock = {
  signup: jest.fn((data) => new UserResponseDto(mockAuthenticatedUser(data))),
  signin: jest.fn((data) => new UserResponseDto(mockAuthenticatedUser(data))),
};
