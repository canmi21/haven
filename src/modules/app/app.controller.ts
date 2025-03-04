import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LicenseController } from '../license/license.controller';
import { TotpController } from '../totp/totp.controller';
import { HealthController } from '../health/health.controller';
import { uptime, cpus, totalmem, freemem } from 'os';

@Controller()
export class AppController {
  private readonly startTime = Date.now();
  
  constructor(
    private readonly licenseController: LicenseController,
    private readonly totpController: TotpController,
    private readonly healthController: HealthController,
  ) {}

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

  @Get('v1/healthcheck')
  getHealthCheck() {
    return this.healthController.getLive();
  }

  @Get('v1/uptime')
  getUptime() {
    const osUptime = Math.floor(uptime());
    const appUptime = Math.floor((Date.now() - this.startTime) / 1000);
    const cpuLoad = cpus().map(cpu => {
      const total = Object.values(cpu.times).reduce((acc, val) => acc + val, 0);
      return (1 - cpu.times.idle / total) * 100;
    });

    const avgCpuUsage = cpuLoad.reduce((acc, val) => acc + val, 0) / cpuLoad.length;
    const memoryUsage = ((totalmem() - freemem()) / totalmem()) * 100;

    return {
      osUptime,
      appUptime,
      cpuUsage: Number(avgCpuUsage.toFixed(2)),
      memoryUsage: Number(memoryUsage.toFixed(2)),
    };
  }

  @Get('v1/license')
  async getLicense(@Res() res: Response) {
    return this.licenseController.getLicense(res);
  }

  @Get('v1/auth/totp-secret')
  getTotpSecret() {
    return this.totpController.getTotpSecret();
  }
}
