import { Controller, Get } from '@nestjs/common';

@Controller('v1/status')
export class StatusController {
  @Get()
  getStatus() {
    return { status: 'OK', message: 'Service is running smoothly.' };
  }
}
