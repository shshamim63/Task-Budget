export class AssociateTo {
  id: number;

  departmentId: number;
  designationId: number;
  enterpriseId: number;
  affiliateId: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AssociateTo>) {
    Object.assign(this, partial);
  }
}
