import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { EnterpriseService } from './exterprises.service';

import { CreateEnterpriseDto } from './dto/create-enterprise.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { EnterpriseDto } from './dto/enterprise.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('enterprises')
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  @Roles(UserType.SUPER)
  @Post()
  async createEnterprise(@Body() payload: CreateEnterpriseDto) {
    const newEnterprise =
      await this.enterpriseService.createEnterprise(payload);

    return new EnterpriseDto(newEnterprise);
  }
}
