export const PrismaServiceMock = {
  associate: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  userTask: {
    createMany: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
  department: {
    create: jest.fn(),
  },
};
