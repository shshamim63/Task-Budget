import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { instanceToPlain } from 'class-transformer';

import { SignInDto, SignUpDto } from './dto/auth-credentials.dto';
import { UserResponseDto } from './dto/user.dto';

import { AuthService } from './auth.service';

import { REFRESH_TOKEN_COOKIE_OPTIONS } from '../utils/constants';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  @UseInterceptors(ClassSerializerInterceptor)
  async signup(@Body() singUpcredentials: SignUpDto, @Res() res: Response) {
    const singupInfo = await this.authService.signup(singUpcredentials);

    const signupInfo = new UserResponseDto(singupInfo);
    const plainSignupInfo = instanceToPlain(signupInfo);

    res.cookie(
      'refreshToken',
      singupInfo.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );

    res.status(201).json(plainSignupInfo);
  }

  @Post('/login')
  @UseInterceptors(ClassSerializerInterceptor)
  async signin(@Body() signInCredentials: SignInDto, @Res() res: Response) {
    const loginInfo = await this.authService.signin(signInCredentials);

    const userLoginInfo = new UserResponseDto(loginInfo);
    const plainUserLoginInfo = instanceToPlain(userLoginInfo);

    res.cookie(
      'refreshToken',
      loginInfo.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );

    res.status(200).json(plainUserLoginInfo);
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
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshToken(@Req() request: Request, @Res() res: Response) {
    const data = await this.authService.tokenRefresh(request);

    const refresTokenInfo = new UserResponseDto(data);
    const plainRefresTokenInfo = instanceToPlain(refresTokenInfo);

    res.cookie(
      'refreshToken',
      refresTokenInfo.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS,
    );
    res.status(200).json(plainRefresTokenInfo);
  }
}
