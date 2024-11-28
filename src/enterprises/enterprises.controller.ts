import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { EnterpriseService } from './exterprises.service';

import { CreateEnterpriseDto } from './dto/create-enterprise.dto';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserType } from '@prisma/client';

@UseGuards(AuthGuard, RolesGuard)
@Controller('enterprises')
export class EnterpriseController {
  constructor(private readonly enterpriseService: EnterpriseService) {}

  @Roles(UserType.SUPER)
  @Post()
  createEnterprise(@Body() payload: CreateEnterpriseDto) {
    return this.enterpriseService.createEnterprise(payload);
  }
}
