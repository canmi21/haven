import { Module } from '@nestjs/common';
import { TotpConfig } from './totp.config';

@Module({
  providers: [TotpConfig],
  exports: [TotpConfig],
})
export class TotpModule {}
