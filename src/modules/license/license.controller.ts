import { Controller, Get } from '@nestjs/common';

@Controller('license')
export class LicenseController {
  @Get()
  getLicense() {
    return { license: 'MIT', description: 'This is a sample license.' };
  }
}
