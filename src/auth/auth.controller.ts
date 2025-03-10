import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth-credentials.dto';

import { Request, Response } from 'express';

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
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json(singupInfo);
  }

  @Post('/login')
  async signin(@Body() signInCredentials: SignInDto, @Res() res: Response) {
    const loginInfo = await this.authService.signin(signInCredentials);

    res.cookie('refreshToken', loginInfo.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json(loginInfo);
  }

  @Post('/refresh')
  async refreshToken(@Req() request: Request, @Res() res: Response) {
    const refresTokenInfo = await this.authService.tokenRefresh(request);
    res.cookie('refreshToken', refresTokenInfo.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json(refresTokenInfo);
  }
}
