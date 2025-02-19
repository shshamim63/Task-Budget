import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth-credentials.dto';

import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() singUpcredentials: SignUpDto, @Res() res: Response) {
    const singupInfo = await this.authService.signup(singUpcredentials);

    res.cookie('refreshToken', singupInfo.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return singupInfo;
  }

  @Post('/login')
  async signin(@Body() signInCredentials: SignInDto, @Res() res: Response) {
    const loginInfo = await this.authService.signin(signInCredentials);

    res.cookie('refreshToken', loginInfo.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return loginInfo;
  }
}
