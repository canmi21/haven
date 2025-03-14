import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { uptime, cpus, totalmem, freemem } from 'os';
import { TotpGuard } from '../totp/totp.guard';
import { rateLimiter } from '../../utils/limiter';
import { errorResponse, StatusCode } from '../../utils/response';

@Controller('v1/uptime')
export class UptimeController {
  private readonly startTime = Date.now();

  @Get()
  @UseGuards(TotpGuard)
  async getUptime(@Req() req: Request, @Res() res: Response) {
    try {
      const ip = req.ip;
      if (!ip) {
        throw new Error('IP address is undefined');
      }

      const allowed = await rateLimiter(ip, req.path, 10);
      if (!allowed) {
        return res.status(StatusCode.TOO_MANY_REQUESTS).json(
          errorResponse(StatusCode.TOO_MANY_REQUESTS, 'Rate limit exceeded')
        );
      }

      const osUptime = Math.floor(uptime());
      const appUptime = Math.floor((Date.now() - this.startTime) / 1000);
      const cpuLoad = cpus().map(cpu => {
        const total = Object.values(cpu.times).reduce((acc, val) => acc + val, 0);
        return (1 - cpu.times.idle / total) * 100;
      });

      const avgCpuUsage = cpuLoad.reduce((acc, val) => acc + val, 0) / cpuLoad.length;
      const memoryUsage = ((totalmem() - freemem()) / totalmem()) * 100;

      return res.json({
        osUptime,
        appUptime,
        cpuUsage: Number(avgCpuUsage.toFixed(2)),
        memoryUsage: Number(memoryUsage.toFixed(2)),
      });
    } catch (error) {
      console.error('! Error in getUptime:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json(
        errorResponse(StatusCode.INTERNAL_SERVER_ERROR, error.message)
      );
    }
  }
}