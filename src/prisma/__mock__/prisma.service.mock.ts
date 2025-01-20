export const PrismaServiceMock = {
  associate: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
  },
};
