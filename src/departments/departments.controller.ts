import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserType } from '@prisma/client';

import { DepartmentService } from './departments.service';
import { CreateDepartmentDto } from './dto/createDepartment.dto';

@Controller('departments')
@UseGuards(AuthGuard, RolesGuard)
export class DepartmentController {
  constructor(private readonly designationService: DepartmentService) {}

  @Post()
  @Roles(UserType.SUPER)
  createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.designationService.createDepartment(createDepartmentDto);
  }
}
