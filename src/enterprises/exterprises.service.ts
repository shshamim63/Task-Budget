import { Injectable } from '@nestjs/common';
import { Enterprise } from '@prisma/client';

import { EnterpriseRepository } from './enterprise.repository';

import { CreateEnterpriseDto } from './dto/create-enterprise.dto';

@Injectable()
export class EnterpriseService {
  constructor(private readonly enterpriseRepository: EnterpriseRepository) {}

  async createEnterprise(data: CreateEnterpriseDto): Promise<Enterprise> {
    const enterprise = await this.enterpriseRepository.create(data);
    return enterprise;
  }
}
