import { Injectable } from '@nestjs/common';
import { EnterpriseRepository } from './enterprise.repository';
import { CreateEnterpriseDto } from './dto/create-enterprise.dto';
import { EnterpriseDto } from './dto/enterprise.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class EnterpriseService {
  constructor(private readonly enterpriseRepository: EnterpriseRepository) {}

  async createEnterprise(data: CreateEnterpriseDto) {
    const enterprise = await this.enterpriseRepository.create(data);
    return plainToInstance(EnterpriseDto, enterprise);
  }
}
