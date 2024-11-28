export class EnterpriseDto {
  id: number;
  name: string;
  logo?: string;
  registrationNumber?: string;
  establishedAt?: Date;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<EnterpriseDto>) {
    Object.assign(this, partial);
  }
}
