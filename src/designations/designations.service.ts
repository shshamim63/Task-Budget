import { Injectable } from '@nestjs/common';

import { CreateDesignationDto } from './dto/createDesignation.dto';
import { DesignationRepository } from './designations.repository';

import { DesignationWithSeletedPayload } from './interface/designation.interface';

@Injectable()
export class DesignationService {
  constructor(private readonly designationRepository: DesignationRepository) {}

  async createDesignation(
    payload: CreateDesignationDto,
  ): Promise<DesignationWithSeletedPayload> {
    const { name, description, departmentId } = payload;

    const createPayload = {
      data: {
        name,
        description,
        department: { connect: { id: departmentId } },
      },
      select: {
        id: true,
        name: true,
        description: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    };

    const designation = await this.designationRepository.create(createPayload);
    return designation;
  }
}
