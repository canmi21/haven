import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PortConfigService } from './port.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [ConfigService, PortConfigService],
  exports: [ConfigService, PortConfigService],
})
export class AppConfigModule {}
