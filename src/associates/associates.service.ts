import { Injectable } from '@nestjs/common';

import { Associate } from '@prisma/client';

import { AssociateRepository } from './associate.repository';

import { CreateAssociateDto } from './dto/create-associate.dto';

import { REDIS_KEYS_FOR_ASSOCIATE } from '../utils/redis-keys';
import { CreateAssociateResult } from './Interfaces/associate.interface';

@Injectable()
export class AssociateService {
  constructor(private readonly associateRepository: AssociateRepository) {}

  async createAssociate(
    body: CreateAssociateDto,
  ): Promise<CreateAssociateResult> {
    const { departmentId, designationId, enterpriseId, affiliateId } = body;

    const createAssociatePayload = {
      data: {
        department: { connect: { id: departmentId } },
        designation: { connect: { id: designationId } },
        enterprise: { connect: { id: enterpriseId } },
        affiliate: { connect: { id: affiliateId } },
      },
      select: {
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
      },
    };

    const associate = await this.associateRepository.create({
      ...createAssociatePayload,
    });
    return associate;
  }

  async userAssociatesTo(userId: number): Promise<Associate[]> {
    const userAssociateToQuery = { affiliateId: userId };
    const { PREFIX, SUFFIX } = REDIS_KEYS_FOR_ASSOCIATE.AFFILIATE_TO;
    const redisKey = `${PREFIX}-${userId}-${SUFFIX}`;

    const associatesTo = await this.associateRepository.findMany({
      redisKey,
      query: userAssociateToQuery,
    });

    return associatesTo;
  }
}
