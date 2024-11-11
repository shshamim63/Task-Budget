import { mockUser } from './auth-data.mock';

export const UserRepositoryMock = {
  findFirst: jest.fn().mockImplementation(async () => {
    return mockUser();
  }),

  findUnique: jest.fn().mockImplementation(async (query) => {
    return query.where.email === 'existing@example.com' ? mockUser() : null;
  }),

  findMany: jest.fn().mockResolvedValue([mockUser(), mockUser()]),

  create: jest.fn().mockImplementation(async (data) => {
    return {
      ...mockUser(),
      ...data,
    };
  }),

  update: jest.fn().mockImplementation(async (query, data) => {
    return {
      ...mockUser(),
      ...data,
    };
  }),

  delete: jest.fn().mockResolvedValue(mockUser()),
};
