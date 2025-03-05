import { Module } from '@nestjs/common';
import { TotpController } from './totp.controller';

@Module({
  controllers: [TotpController],
})
export class TotpModule {}
