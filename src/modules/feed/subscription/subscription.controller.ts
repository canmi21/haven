import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as yaml from 'js-yaml';
import { errorResponse, StatusCode } from '../../../utils/response';
import { rateLimiter } from '../../../utils/limiter';
import { config } from './subscriptions';

@Controller('v1/feeds/subscription')
export class SubscriptionController {
  @Get()
  async getSubscription(@Res() res: Response) {
    try {
      const ip = res.req.ip;
      if (!ip) {
        return res.status(StatusCode.BAD_REQUEST).json(errorResponse(StatusCode.BAD_REQUEST, 'IP address is undefined'));
      }

      const allowed = await rateLimiter(ip, res.req.path, 10, 1);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      const yamlData = yaml.dump(config);
      res.setHeader('Content-Type', 'text/yaml');
      return res.send(yamlData);
    } catch (error) {
      console.error('! Error in getSubscription:', error);

      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to load subscription data')
      );
    }
  }
}
