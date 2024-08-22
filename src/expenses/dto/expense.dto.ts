import { Prisma } from '@prisma/client';

export class ExpenseResponseDto {
  id: number;
  description: string;
  amount: number;
  taskId: number;
  contributorId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    partial: Partial<
      Omit<ExpenseResponseDto, 'amount'> & { amount: Prisma.Decimal }
    >,
  ) {
    Object.assign(this, {
      ...partial,
      amount: partial.amount ? partial.amount.toNumber() : 0,
    });
  }
}
