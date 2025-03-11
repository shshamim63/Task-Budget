import { Injectable } from '@nestjs/common';

import { CreateDepartmentDto } from './dto/createDepartment.dto';
import { DepartmentRepository } from './departments.repository';
import { DepartmentDto } from './dto/department.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DepartmentService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async createDepartment(payload: CreateDepartmentDto) {
    const department = await this.departmentRepository.create({
      data: payload,
    });
    return plainToInstance(DepartmentDto, department);
  }
}
