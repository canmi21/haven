import { Controller, Get, NotFoundException } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    throw new NotFoundException();
  }
}
