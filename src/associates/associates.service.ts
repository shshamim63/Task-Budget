import { Injectable } from '@nestjs/common';

import { AssociateRepository } from './associate.repository';

import { CreateAssociateDto } from './dto/create-associate.dto';
import { AssociateDto } from './dto/associate.dto';
import { AssociateTo } from './dto/associate-to.dto';
import { REDIS_KEYS_FOR_ASSOCIATE } from '../utils/redis-keys';

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

  async userAssociatesTo(userId: number): Promise<AssociateTo[]> {
    const userAssociateToQuery = { affiliateId: userId };
    const { PREFIX, SUFFIX } = REDIS_KEYS_FOR_ASSOCIATE.AFFILIATE_TO;

    const associatesTo = await this.associateRepository.findMany({
      redisKey: `${PREFIX}-${userId}-${SUFFIX}`,
      query: userAssociateToQuery,
    });

    return associatesTo.map((associate) => new AssociateTo(associate));
  }
}
