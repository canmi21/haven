import { Controller, Get, Res } from '@nestjs/common';
import { uptime, cpus, totalmem, freemem } from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';

@Controller()
export class AppController {
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
      memoryUsage: Number(memoryUsage.toFixed(2))
    };
  }

  @Get('license')
  getLicense(@Res() res: Response) {
    const licensePath = path.join(__dirname, 'license');
    fs.readFile(licensePath, 'utf8', (err, data) => {
      if (err) {
        res.status(500).send('Error reading license file');
      } else {
        res.setHeader('Content-Type', 'text/plain');
        res.send(data);
      }
    });
  }
}
