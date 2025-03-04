import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StatusModule } from './modules/status/status.module';
import { LicenseModule } from './modules/license/license.module';

@Module({
  imports: [StatusModule, LicenseModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
