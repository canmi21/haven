import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { errorResponse, StatusCode } from '../../utils/response';
import { rateLimiter } from '../../utils/limiter';

@Controller('license')
export class LicenseController {
  @Get()
  async getLicense(@Res() res: Response) {
    const licenseUrl = 'https://raw.githubusercontent.com/canmi21/haven/refs/heads/main/license';

    try {
      const key = `get-license`;
      const limit = 5;
      const windowMs = 60 * 1000;

      console.log('> Checking rate limit...');
      try {
        await rateLimiter(key, limit, windowMs);
        console.log('> Rate limit check passed.');
      } catch (error) {
        console.error('! Rate limit check failed:', error);
        if (error.message === 'Rate limit exceeded') {
          return res.status(StatusCode.TOO_MANY_REQUESTS).json(errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded'));
        }
        throw error;
      }

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
