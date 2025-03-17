import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('api/v1/feeds/subscription')
export class SubscriptionController {
  private readonly configPath = path.join(__dirname, 'subscriptions.yaml');

  @Get()
  async getSubscription(@Res() res: Response) {
    try {
      const data = fs.readFileSync(this.configPath, 'utf-8');
      res.setHeader('Content-Type', 'text/yaml');
      return res.send(data);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to load subscription file' });
    }
  }
}