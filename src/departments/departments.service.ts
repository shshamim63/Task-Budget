import { Injectable } from '@nestjs/common';

import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { DepartmentRepository } from './departments.repository';
import { DepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async createDepartment(payload: CreateDepartmentDto) {
    const department = await this.departmentRepository.create({
      data: payload,
    });
    return new DepartmentDto(department);
  }
}
