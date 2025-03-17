import { Injectable } from '@nestjs/common';

import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { DepartmentRepository } from './departments.repository';
import { Department } from '@prisma/client';

@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async createDepartment(payload: CreateDepartmentDto): Promise<Department> {
    const department = await this.departmentRepository.create({
      data: payload,
    });
    return department;
  }
}
