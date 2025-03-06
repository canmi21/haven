import { Module } from '@nestjs/common';
import { UptimeController } from './uptime.controller';
import { TotpModule } from '../totp/totp.module';

@Module({
  imports: [TotpModule],
  controllers: [UptimeController],
})
export class UptimeModule {}
