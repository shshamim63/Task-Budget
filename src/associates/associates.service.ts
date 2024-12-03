import { Injectable } from '@nestjs/common';

import { AssociateRepository } from './associate.repository';

import { CreateAssociateDto } from './dto/create-associate.dto';
import { AssociateDto } from './dto/associate.dto';

@Injectable()
export class AssociateService {
  constructor(private readonly associateRepository: AssociateRepository) {}

  async createAssociate(body: CreateAssociateDto): Promise<AssociateDto> {
    const { departmentId, designationId, enterpriseId, affiliateId } = body;

    const query = {
      id: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
      designation: {
        select: {
          id: true,
          name: true,
        },
      },
      enterprise: {
        select: {
          id: true,
          name: true,
        },
      },
      affiliate: {
        select: {
          id: true,
          email: true,
        },
      },
    };

    const data = {
      department: { connect: { id: departmentId } },
      designation: { connect: { id: designationId } },
      enterprise: { connect: { id: enterpriseId } },
      affiliate: { connect: { id: affiliateId } },
    };

    const associate = await this.associateRepository.create({ data, query });
    return new AssociateDto(associate);
  }
}
