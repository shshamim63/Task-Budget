import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { UsersService } from './users.service';
import { UserResponseDto } from '../auth/dto/user.dto';
import {
  UpdatePasswordRequestBody,
  UpdateUserDto,
} from './dto/update-user.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { UserType } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  async getProfile(@User() user: JWTPayload): Promise<UserResponseDto> {
    const currentUser = await this.usersService.getProfile(user);
    return new UserResponseDto(currentUser);
  }

  @Patch('/:id/profile/active')
  @Roles(UserType.SUPER)
  async activateUserAccount(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.accountActivation(id);
  }

  @Patch('/:id/profile')
  async updateUserProfile(
    @User() user: JWTPayload,
    @Body() updatePayload: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const updatedUser = await this.usersService.updateUserProfile(
      updatePayload,
      user,
      id,
    );
    return new UserResponseDto(updatedUser);
  }

  @Patch('/:id/password')
  async updateUserPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePasswordRequestBody: UpdatePasswordRequestBody,
    @User() user: JWTPayload,
  ): Promise<string> {
    return await this.usersService.updateUserPassword(
      id,
      user,
      updatePasswordRequestBody,
    );
  }
}
