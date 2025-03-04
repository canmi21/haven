import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('license')
export class LicenseController {
  @Get()
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
