import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { UserType } from '@prisma/client';

import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../decorators/roles.decorator';

import { AssociateService } from './associates.service';

import { CreateAssociateDto } from './dto/create-associate.dto';
import { AssociateDto } from './dto/associate.dto';
import { AssociateTo } from './dto/associate-to.dto';

@Controller('associates')
@UseGuards(AuthGuard, RolesGuard)
export class AssociateController {
  constructor(private readonly associateService: AssociateService) {}

  @Post()
  @Roles(UserType.SUPER, UserType.ADMIN)
  async createAssociate(
    @Body() body: CreateAssociateDto,
  ): Promise<AssociateDto> {
    const associate = await this.associateService.createAssociate(body);
    return new AssociateDto(associate);
  }

  @Get('/:userId')
  @Roles(UserType.SUPER)
  async getUserAssociatedTo(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<AssociateTo[]> {
    const associatesTo = await this.associateService.userAssociatesTo(userId);

    return associatesTo.map((associate) => new AssociateTo(associate));
  }
}
