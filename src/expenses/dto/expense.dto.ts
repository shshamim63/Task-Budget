export class ExpenseResponseDto {
  id: number;
  description: string;
  amount: number;
  taskId: number;
  contributorId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ExpenseResponseDto>) {
    Object.assign(this, partial);
  }
}
