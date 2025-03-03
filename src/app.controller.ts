import { Controller, Get, Res } from '@nestjs/common';
import { uptime, cpus, totalmem, freemem } from 'os';
import fetch from 'node-fetch';
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
  async getLicense(@Res() res: Response) {
    const licenseUrl = 'https://raw.githubusercontent.com/canmi21/haven/refs/heads/main/license';
  
    try {
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
