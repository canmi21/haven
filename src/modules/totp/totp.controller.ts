import { Controller, Get } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Controller('v1/auth/totp-secret')
export class TotpController {
  @Get()
  generateTotpSecret() {
    return {
      secret: speakeasy.generateSecret({ length: 20 }).base32,
    };
  }
}
