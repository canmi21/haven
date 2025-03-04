import { Module } from '@nestjs/common';
import { UptimeController } from './uptime.controller';

@Module({
  controllers: [UptimeController],
})
export class UptimeModule {}
