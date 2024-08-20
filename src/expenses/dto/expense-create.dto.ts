import { IsDecimal, IsNotEmpty, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDecimal()
  amount: number;
}
