import { Controller, Get } from '@nestjs/common';
import { uptime, cpus, totalmem, freemem } from 'os';

@Controller('api')
export class ApiController {
  private readonly startTime = Date.now();

  @Get('healthcheck')
  getLive() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }

  @Get('uptime')
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