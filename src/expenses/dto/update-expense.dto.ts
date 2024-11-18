import { IsNumber, IsOptional, Min } from 'class-validator';
import { CreateExpenseDto } from './create-expense.dto';

export class UpdateExpenseDto extends CreateExpenseDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  contributorId: number;
}
