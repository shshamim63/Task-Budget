import { IsOptional, IsString } from 'class-validator';
import { Match } from '../../decorators/match.decorator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  username: string;
}

export class UpdatePasswordRequestBody {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;

  @IsString()
  @Match('newPassword')
  confirmNewPassword: string;
}
