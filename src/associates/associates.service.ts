import { Injectable } from '@nestjs/common';

import { Associate } from '@prisma/client';

import { AssociateRepository } from './associate.repository';

import { CreateAssociateDto } from './dto/create-associate.dto';

import { CreateAssociateResult } from './Interfaces/associate.interface';
import { AssociateCacheService } from './associates.cache.service';

@Injectable()
export class AssociateService {
  constructor(
    private readonly associateRepository: AssociateRepository,
    private readonly associateCacheService: AssociateCacheService,
  ) {}

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
    const query = { affiliateId: userId };
    let associatesTo: Associate[];

    associatesTo =
      await this.associateCacheService.getAssociatesToFromCache(userId);

    if (!associatesTo) {
      associatesTo = await this.associateRepository.findMany(query);
      await this.associateCacheService.setAssociatesToFromCache(
        userId,
        associatesTo,
      );
    }

    return associatesTo;
  }
}
