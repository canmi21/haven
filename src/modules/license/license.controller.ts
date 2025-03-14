import { Controller, Get, Res, Request } from '@nestjs/common';
import { Response } from 'express';
import { errorResponse, StatusCode } from '../../utils/response';
import { rateLimiter } from '../../utils/limiter';

@Controller('license')
export class LicenseController {
  @Get()
  async getLicense(@Res() res: Response, @Request() req) {
    const licenseUrl = 'https://raw.githubusercontent.com/canmi21/haven/refs/heads/main/license';

    try {
      const key = `get-license:${req.ip}`;
      const limit = 5;
      const windowMs = 60 * 1000;

      await rateLimiter(key, limit, windowMs);

      const { default: fetch } = await import('node-fetch');
      const response = await fetch(licenseUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch license: ${response.statusText}`);
      }

      const data = await response.text();
      
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(`<pre style="white-space: pre-wrap;">${data}</pre>`);
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(errorResponse(StatusCode.INTERNAL_SERVER_ERROR));
    }
  }
}
