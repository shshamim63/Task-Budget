import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserType } from '@prisma/client';
import { CreateDesignationDto } from './dto/createDesignation.dto';
import { DesignationService } from './designations.service';

@Controller('designations')
@UseGuards(AuthGuard, RolesGuard)
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @Post()
  @Roles(UserType.SUPER)
  createDesignation(@Body() createDesignationDto: CreateDesignationDto) {
    return this.designationService.createDesignation(createDesignationDto);
  }
}
