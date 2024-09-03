import { IsNumber, Min } from 'class-validator';
import { CreateExpenseDto } from './create-expense.dto';

export class UpdateExpenseDto extends CreateExpenseDto {
  @IsNumber()
  @Min(0)
  contributorId: number;
}
