import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import { UserRepository } from '../user.repository';
import { ERROR_NAME, RESPONSE_MESSAGE } from '../../utils/constants';
import { AuthUser } from '../interfaces/auth.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.tokenService.getTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.MISSING_AUTH,
        ERROR_NAME.MISSING_AUTH,
      );
    }

    const payload = this.tokenService.verifyToken(token);

    if (!payload) {
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.INVALID_TOKEN,
        ERROR_NAME.INVALID_TOKEN,
      );
    }

    const user = (await this.userRepository.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        username: true,
        userType: true,
        companionOf: { select: { id: true } },
      },
    })) as unknown as AuthUser;

    if (!user) {
      throw new UnauthorizedException(
        RESPONSE_MESSAGE.USER_MISSING,
        ERROR_NAME.USER_MISSING,
      );
    }

    const currentPayload = this.tokenService.createAuthTokenPayload({
      ...user,
    });
    request.user = currentPayload;
    return true;
  }
}
