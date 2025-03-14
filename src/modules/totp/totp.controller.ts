import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { TotpGuard } from './totp.guard';
import { Request, Response } from 'express';
import * as speakeasy from 'speakeasy';
import { TotpService } from './totp.service';
import { successResponse, errorResponse, StatusCode } from '../../utils/response';
import { rateLimiter } from '../../utils/limiter';

@Controller('v1/auth/totp-secret')
export class TotpController {
  constructor(private readonly totpService: TotpService) {}

  @Get()
  async generateTotpSecret(@Query('length') length: number, @Req() req: Request, @Res() res: Response) {
    try {
      const ip = req.ip;
      if (!ip) {
        throw new Error('IP address is undefined');
      }

      const allowed = await rateLimiter(ip, req.path, 3);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      const secretLength = Math.min(Number(length) || 32, 256);
      const secret = speakeasy.generateSecret({ length: secretLength }).base32;
      return res.json(successResponse({ secret }));
    } catch (error) {
      console.error('! Error in generateTotpSecret:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
  @Get('verify')
  @UseGuards(TotpGuard)
  async verifyTotp(@Req() req: Request, @Res() res: Response) {
    try {
      const ip = req.ip;
      if (!ip) {
        throw new Error('IP address is undefined');
      }

      const allowed = await rateLimiter(ip, req.path, 5);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      return res.json(successResponse({ valid: true }, 'Verification successful, but no further actions are provided.'));
    } catch (error) {
      console.error('! Error in verifyTotp:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
}