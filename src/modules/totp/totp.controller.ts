import { Controller, Get } from '@nestjs/common';
import { TotpService } from './totp.service';

@Controller('v1/auth')
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

  @Get('totp-secret')
  getTotpSecret() {
    return { secret: this.totpService.generateSecret() };
  }
}
