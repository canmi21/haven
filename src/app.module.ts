import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StatusModule } from './modules/status/status.module';
import { LicenseModule } from './modules/license/license.module';
import { UptimeModule } from './modules/uptime/uptime.module';
//import { AuthModule } from './modules/auth/auth.module';
import { TotpModule } from './modules/totp/totp.module';

@Module({
  imports: [StatusModule, LicenseModule, UptimeModule, /*AuthModule,*/ TotpModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
