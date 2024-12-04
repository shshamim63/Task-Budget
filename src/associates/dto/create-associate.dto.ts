import { IsNumber } from 'class-validator';

export class CreateAssociateDto {
  @IsNumber()
  departmentId: number;

  @IsNumber()
  designationId: number;

  @IsNumber()
  enterpriseId: number;

  @IsNumber()
  affiliateId: number;
}
