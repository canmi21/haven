import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { errorResponse, StatusCode } from '../../../utils/response';
import { rateLimiter } from '../../../utils/limiter';

@Controller('v1/feeds/subscription')
export class SubscriptionController {
  private readonly configPath: string;

  constructor() {

    this.configPath = process.env.NODE_ENV === 'production'
      ? path.resolve(process.cwd(), 'dist/modules/feed/subscription/subscriptions.yaml')
      : path.resolve(process.cwd(), 'src/modules/feed/subscription/subscriptions.yaml');
  }

  @Get()
  async getSubscription(@Res() res: Response) {
    try {
      const ip = res.req.ip;
      if (!ip) {
        return res.status(StatusCode.BAD_REQUEST).json(errorResponse(StatusCode.BAD_REQUEST, 'IP address is undefined'));
      }

      const allowed = await rateLimiter(ip, res.req.path, 10);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      const data = fs.readFileSync(this.configPath, 'utf-8');
      res.setHeader('Content-Type', 'text/yaml');
      return res.send(data);
    } catch (error) {
      console.error('! Error in getSubscription:', error);

      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to load subscription file')
      );
    }
  }
}
