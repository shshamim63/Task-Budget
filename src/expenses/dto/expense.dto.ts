import { Prisma } from '@prisma/client';

export class ExpenseResponseDto {
  id: number;
  description: string;
  amount: number;
  taskId: number;
  contributor: {
    username: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(
    partial: Partial<
      Omit<ExpenseResponseDto, 'amount'> & { amount: Prisma.Decimal }
    >,
  ) {
    Object.assign(this, {
      ...partial,
      amount: partial.amount ? Number(partial.amount) : 0,
    });
  }
}
