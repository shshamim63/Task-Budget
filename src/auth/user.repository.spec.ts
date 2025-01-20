import { Test, TestingModule } from '@nestjs/testing';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';
import { UserRepository } from './user.repository';
import { UserMockQuery } from './__mock__/auth-data.mock';
import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';

describe('UserRepository', () => {
  let repository: UserRepository;
  let prismaService: PrismaService;
  let asyncErrorHandlerService: AsyncErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: PrismaServiceMock },
        {
          provide: AsyncErrorHandlerService,
          useValue: AsyncErrorHandlerServiceMock,
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    asyncErrorHandlerService = module.get<AsyncErrorHandlerService>(
      AsyncErrorHandlerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const query = UserMockQuery();

  describe('findFirst', () => {
    it('should call asyncErrorHandlerService and prisma user findFirst method', async () => {
      PrismaServiceMock.user.findFirst.mockResolvedValue(true);
      await repository.findFirst(query);
      expect(prismaService.user.findFirst).toHaveBeenCalled();
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
    });
  });

  describe('findUnique', async () => {
    it('should call asyncErrorHandlerService and prisma user findUnique method', async () => {
      PrismaServiceMock.user.findUnique.mockResolvedValue(true);
      await repository.findUnique(query);
      expect(prismaService.user.findUnique).toHaveBeenCalled();
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
    });
  });

  describe('findMany', async () => {
    it('should call asyncErrorHandlerService and prisma user findMany method', async () => {
      PrismaServiceMock.user.findUnique.mockResolvedValue(true);
      await repository.findMany(query);
      expect(prismaService.user.findMany).toHaveBeenCalled();
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
    });
  });
});
