import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PortConfig } from './port/port.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [ConfigService, PortConfig],
  exports: [ConfigService, PortConfig],
})
export class AppConfigModule {}
