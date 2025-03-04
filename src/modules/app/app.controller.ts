import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  private readonly startTime = Date.now();

  @Get()
  getRoot(@Req() req: Request, @Res() res: Response) {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent');

    return res.json({
      status: 'OK',
      timestamp,
      userAgent,
    });
  }

  @Get('license')
  async getLicense(@Res() res: Response) {
    const licenseUrl = 'https://raw.githubusercontent.com/canmi21/haven/refs/heads/main/license';

    try {
      const { default: fetch } = await import('node-fetch');
      const response = await fetch(licenseUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch license: ${response.statusText}`);
      }
      const data = await response.text();

      res.setHeader('Content-Type', 'text/html');
      res.send(`<pre style="white-space: pre-wrap;">${data}</pre>`);
    } catch (error) {
      res.status(500).send(`<pre style="white-space: pre-wrap;">Error fetching license: ${error.message}</pre>`);
    }
  }
}
