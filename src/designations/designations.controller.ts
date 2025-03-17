import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { CreateDesignationDto } from './dto/createDesignation.dto';
import { DesignationService } from './designations.service';
import { DesignationDto } from './dto/designation.dto';

@Controller('designations')
@UseGuards(AuthGuard, RolesGuard)
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @Post()
  @Roles(UserType.SUPER)
  async createDesignation(@Body() createDesignationDto: CreateDesignationDto) {
    const newDesignation =
      await this.designationService.createDesignation(createDesignationDto);
    return new DesignationDto(newDesignation);
  }
}
