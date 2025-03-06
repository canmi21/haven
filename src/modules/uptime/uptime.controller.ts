import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { uptime, cpus, totalmem, freemem } from 'os';
import { TotpGuard } from '../totp/totp.guard';

@Controller('v1/uptime')
export class UptimeController {
  private readonly startTime = Date.now();

  @Get()
  @UseGuards(TotpGuard)
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
}