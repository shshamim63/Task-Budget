import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { JWTPayload } from '../auth/interfaces/auth.interface';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  getProfile(@User() user: JWTPayload) {
    return this.usersService.getProfile(user);
  }
}
