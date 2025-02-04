import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { AsyncErrorHandlerService } from '../helpers/execute-with-error.helper.service';
import { CollaboratorRepository } from './collaborator.repository';

import { PrismaServiceMock } from '../prisma/__mock__/prisma.service.mock';
import { AsyncErrorHandlerServiceMock } from '../helpers/__mock__/execute-with-error.helper.service.mock';
import { faker } from '@faker-js/faker/.';

describe('', () => {
  let repository: CollaboratorRepository;
  let prismaService: PrismaService;
  let asyncErrorHandlerService: AsyncErrorHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaboratorRepository,
        { provide: PrismaService, useValue: PrismaServiceMock },
        {
          provide: AsyncErrorHandlerService,
          useValue: AsyncErrorHandlerServiceMock,
        },
      ],
    }).compile();

    repository = module.get<CollaboratorRepository>(CollaboratorRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    asyncErrorHandlerService = module.get<AsyncErrorHandlerService>(
      AsyncErrorHandlerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMany', () => {
    it('should call asyncErrorHandlerService and userTask.createMany method', async () => {
      const data = [
        {
          taskId: faker.number.int(),
          memberId: faker.number.int(),
          createdAt: faker.date.anytime(),
          updatedAt: faker.date.anytime(),
        },
      ];
      PrismaServiceMock.userTask.createMany.mockResolvedValue(true);
      await repository.createMany(data);
      expect(prismaService.userTask.createMany).toHaveBeenCalledWith({ data });
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should call asyncErrorHandlerService and userTask.delete method', async () => {
      const query = { where: { id: faker.number.int() } };
      PrismaServiceMock.userTask.delete.mockResolvedValueOnce(true);
      await repository.delete(query);
      expect(prismaService.userTask.delete).toHaveBeenCalled();
      expect(asyncErrorHandlerService.execute).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });
  });

  describe('findUnique', () => {
    it('should call asyncErrorHandlerService and userTask.findUnique method', async () => {
      const query = { where: { id: faker.number.int() } };
      PrismaServiceMock.userTask.findUnique.mockResolvedValue(true);
      await repository.findUnique(query);
      expect(prismaService.userTask.findUnique).toHaveBeenCalledWith(query);
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
    });
  });
});
