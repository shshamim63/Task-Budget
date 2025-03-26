import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { UsersService } from './users.service';
import { UserResponseDto } from '../auth/dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  async getProfile(@User() user: JWTPayload): Promise<UserResponseDto> {
    const currentUser = await this.usersService.getProfile(user);
    return new UserResponseDto(currentUser);
  }

  @Post('/:id/profile')
  async updateUserProfile(
    @User() user: JWTPayload,
    @Body() updatePayload: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.updateUserProfile(
      updatePayload,
      user,
    );
    return new UserResponseDto(updatedUser);
  }
}
