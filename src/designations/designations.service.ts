import { Injectable } from '@nestjs/common';

import { CreateDesignationDto } from './dto/createDesignation.dto';
import { DesignationRepository } from './designations.repository';
import { DesignationDto } from './dto/designation.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DesignationService {
  constructor(private readonly designationRepository: DesignationRepository) {}

  async createDesignation(payload: CreateDesignationDto) {
    const query = {
      id: true,
      name: true,
      description: true,
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    };
    const { name, departmentId, description } = payload;

    const data = {
      name,
      description,
      department: { connect: { id: departmentId } },
    };
    const designation = await this.designationRepository.create({
      data,
      query,
    });
    return plainToInstance(DesignationDto, designation);
  }
}
