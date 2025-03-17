import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { TotpModule } from '../../totp/totp.module';

@Module({
  imports: [TotpModule],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}