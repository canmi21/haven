import { Controller, Get, Query } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Controller('v1/auth/totp-secret')
export class TotpController {
  @Get()
  generateTotpSecret(@Query('length') length?: number) {
    const secretLength = Math.min(Number(length) || 32, 256);
    return {
      secret: speakeasy.generateSecret({ length: secretLength }).base32,
    };
  }
}
