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

  describe('createMany', () => {
    it('it should call asyncErrorHandlerService and userTask.createMany method', async () => {
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
      expect(prismaService.userTask.createMany).toHaveBeenCalled();
      expect(asyncErrorHandlerService.execute).toHaveBeenCalled();
    });
  });
});
