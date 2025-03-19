import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth-credentials.dto';

import { Request, Response } from 'express';
import { UserResponseDto } from './dto/user.dto';
import { REFRESH_TOKEN_COOKIE_OPTIONS } from '../utils/constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() singUpcredentials: SignUpDto, @Res() res: Response) {
    const singupInfo = await this.authService.signup(singUpcredentials);
    res.cookie(
      'refreshToken',
      singupInfo.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );

    res.status(201).json(new UserResponseDto(singupInfo));
  }

  @Post('/login')
  async signin(@Body() signInCredentials: SignInDto, @Res() res: Response) {
    const loginInfo = await this.authService.signin(signInCredentials);

    res.cookie(
      'refreshToken',
      loginInfo.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );

    res.status(200).json(new UserResponseDto(loginInfo));
  }

  @Post('/logout')
  async logout(@Req() request: Request, @Res() res: Response) {
    await this.authService.logout(request);
    res.clearCookie('refreshToken', {
      path: REFRESH_TOKEN_COOKIE_OPTIONS.path,
    });
    res.status(200).json({ message: 'Logout successful' });
  }

  @Post('/refresh')
  async refreshToken(@Req() request: Request, @Res() res: Response) {
    const refresTokenInfo = await this.authService.tokenRefresh(request);
    res.cookie(
      'refreshToken',
      refresTokenInfo.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    res.status(200).json(new UserResponseDto(refresTokenInfo));
  }
}
