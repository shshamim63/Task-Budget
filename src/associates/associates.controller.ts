import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { UserType } from '@prisma/client';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../decorators/roles.decorator';

import { AssociateService } from './associates.service';

import { CreateAssociateDto } from './dto/create-associate.dto';
import { AssociateDto } from './dto/associate.dto';

@Controller('associates')
@UseGuards(AuthGuard, RolesGuard)
export class AssociateController {
  constructor(private readonly associateService: AssociateService) {}

  @Post()
  @Roles(UserType.SUPER, UserType.ADMIN)
  createAssociate(@Body() body: CreateAssociateDto): Promise<AssociateDto> {
    return this.associateService.createAssociate(body);
  }
}