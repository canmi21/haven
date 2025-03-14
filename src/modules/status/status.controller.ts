import { Controller, Get } from '@nestjs/common';
import { successResponse } from '../../utils/response';
import { StatusCode, StatusMessage } from '../../utils/response';

@Controller('v1/status')
export class StatusController {
  @Get()
  getStatus() {
    const statusData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };

    return successResponse(statusData, StatusMessage[StatusCode.SUCCESS]);
  }
}
