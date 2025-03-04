import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { StatusModule } from './modules/status/status.module';  // 引入 StatusModule
import { LicenseModule } from './modules/license/license.module';  // 引入 LicenseModule

@Module({
  imports: [StatusModule, LicenseModule],  // 在 imports 中注册模块
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
