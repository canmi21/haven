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
      if (!ip) {
        throw new Error('IP address is undefined');
      }
      const key = 'get-license';
      const limit = 5;
      const windowMs = 60 * 1000;

      console.log('> Checking rate limit...');
      const allowed = await rateLimiter(ip, key, limit, windowMs);
      if (!allowed) {
        console.log('! Rate limit exceeded for IP:', ip);
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded'));
      }
      console.log('> Rate limit check passed.');

      console.log('> Fetching license from URL...');
      const { default: fetch } = await import('node-fetch');
      const response = await fetch(licenseUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch license: ${response.statusText}`);
      }

      const data = await response.text();

      console.log('> License fetched successfully.');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(`<pre style="white-space: pre-wrap;">${data}</pre>`);
    } catch (error) {
      console.error('! Error during license fetch:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(errorResponse(StatusCode.INTERNAL_SERVER_ERROR, error.message));
    }
  }
}