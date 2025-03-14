import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { rateLimiter } from '../../utils/limiter';
import { successResponse, errorResponse } from '../../utils/response';
import { StatusCode, StatusMessage } from '../../utils/response';

@Controller('v1/status')
export class StatusController {
  @Get()
  async getStatus(@Req() req: Request, @Res() res: Response) {
    const ip = req.ip;
    if (ip === undefined) {
      console.error('! IP address is undefined');
      return res.status(StatusCode.BAD_REQUEST).json(
        errorResponse(StatusCode.BAD_REQUEST, 'IP address is undefined')
      );
    }

    try {
      const allowed = await rateLimiter(ip, req.path, 10);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      const statusData = {
        timestamp: new Date().toISOString(),
      };

      return res.json(successResponse(statusData, StatusMessage[StatusCode.SUCCESS]));
    } catch (error) {
      console.error('! Error during status fetch:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
}
