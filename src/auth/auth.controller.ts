import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(@Body() singUpcredentials: SignUpDto) {
    return this.authService.signup(singUpcredentials);
  }

  @Post('/signin')
  signin(@Body() signInCredentials: SignInDto) {
    return this.authService.signin(signInCredentials);
  }
}
