import { Module } from '@nestjs/common';
import { TotpService } from '../totp/totp.service';
import { TotpController } from '../totp/totp.controller';

@Module({
  controllers: [TotpController],
  providers: [TotpService],
  exports: [TotpService],
})
export class AuthModule {}
