import { Prisma } from '@prisma/client';

export class TaskResponseDto {
  id: number;
  title: string;
  description: string;
  creatorId: number;
  status: string;
  budget: number;
  enterpriseId: number;

  constructor(
    partial: Partial<
      Omit<TaskResponseDto, 'budget'> & { budget?: Prisma.Decimal }
    >,
  ) {
    Object.assign(this, {
      ...partial,
      budget: partial.budget ? Number(partial.budget) : 0,
    });
  }
}
