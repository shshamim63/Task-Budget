export class DesignationDto {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  department: {
    id: number;
    name: string;
    description: string;
  };

  constructor(partial: Partial<DesignationDto>) {
    Object.assign(this, partial);
  }
}
