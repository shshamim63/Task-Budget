export class AssociateDto {
  id: number;

  enterprise: {
    id: number;
    name: string;
  };

  department: {
    id: number;
    name: string;
  };

  designation: {
    id: number;
    name: string;
  };

  affiliate: {
    id: number;
    name: string;
  };

  constructor(partial: Partial<AssociateDto>) {
    Object.assign(this, partial);
  }
}
