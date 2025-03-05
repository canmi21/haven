import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppConfigModule } from './config/config.module';
import { StatusModule } from './modules/status/status.module';
import { LicenseModule } from './modules/license/license.module';
import { UptimeModule } from './modules/uptime/uptime.module';
//import { AuthModule } from './modules/auth/auth.module';
import { TotpModule } from './modules/totp/totp.module';
import { DatabaseModule } from './config/database/database.module';

@Module({
  imports: [AppConfigModule, StatusModule, LicenseModule, UptimeModule, /*AuthModule,*/ TotpModule, DatabaseModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
