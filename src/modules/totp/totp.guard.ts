import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { TotpService } from './totp.service';
import { errorResponse, StatusCode } from '../../utils/response';

@Injectable()
export class TotpGuard implements CanActivate {
  constructor(private readonly totpService: TotpService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.query.token;

    if (!token) {
      throw new HttpException(errorResponse(StatusCode.UNAUTHORIZED), StatusCode.UNAUTHORIZED);
    }

    if (!this.totpService.verify(token)) {
      throw new HttpException(errorResponse(StatusCode.INVALID_CREDENTIALS), StatusCode.INVALID_CREDENTIALS);
    }

    return true;
  }
}
