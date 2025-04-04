import { Controller, Get, Res, Req } from '@nestjs/common';
import { Response, Request } from 'express';
import { errorResponse, StatusCode } from '../../utils/response';
import { rateLimiter } from '../../utils/limiter';

@Controller('license')
export class LicenseController {
  @Get()
  async getLicense(@Req() req: Request, @Res() res: Response) {
    const licenseUrl = 'https://raw.githubusercontent.com/canmi21/haven/refs/heads/main/license';

    try {
      const ip = req.ip;
      if (ip === undefined) {
        throw new Error('IP address is undefined');
      }

      const allowed = await rateLimiter(ip, req.path, 5);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      const { default: fetch } = await import('node-fetch');
      const response = await fetch(licenseUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch license: ${response.statusText}`);
      }

      const data = await response.text();

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(`<pre style="white-space: pre-wrap;">${data}</pre>`);
    } catch (error) {
      console.error('! Error during license fetch:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
}