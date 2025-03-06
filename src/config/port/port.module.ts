import { Module } from '@nestjs/common';
import { PortConfig } from './port.config';

@Module({
  providers: [PortConfig],
  exports: [PortConfig],
})
export class PortModule {}