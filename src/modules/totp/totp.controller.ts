import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import * as speakeasy from 'speakeasy'
import { TotpService } from './totp.service'
import { TotpGuard } from './totp.guard'
import { successResponse } from '../../utils/response'

@Controller('v1/auth/totp-secret')
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

  @Get()
  generateTotpSecret(@Query('length') length?: number) {
    const secretLength = Math.min(Number(length) || 32, 256)
    return successResponse({
      secret: speakeasy.generateSecret({ length: secretLength }).base32,
    })
  }

  @Get('verify')
  @UseGuards(TotpGuard)
  verifyTotp() {
    return successResponse({ valid: true }, 'Verification successful, but no further actions are provided.')
  }
}
