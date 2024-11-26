export class DepartmentDto {
  id: number;
  name: string;

  createdAt: Date;
  updateAt: Date;

  constructor(partial: Partial<DepartmentDto>) {
    Object.assign(this, partial);
  }
}
