import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TotpService } from './/totp.service';

@Injectable()
export class TotpGuard implements CanActivate {
  constructor(private readonly totpService: TotpService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.query.token;

    if (!token) {
      throw new UnauthorizedException('token is missing.');
    }

    if (!this.totpService.verify(token)) {
      throw new UnauthorizedException('Invalid token.');
    }

    return true;
  }
}