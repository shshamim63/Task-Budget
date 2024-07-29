import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from '../../decorators/match.decorator';

export class SignUpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @Match('password')
  confirmPassword: string;
}

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  password: string;
}
