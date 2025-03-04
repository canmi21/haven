import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../../config/database.config';
import { AuthModule } from '../auth/auth.module';
import { HealthModule } from '../health/health.module';
import { AppController } from './app.controller';
import { AppService } from '../../app.service';
import { ApiV1Controller } from '../modules/api/v1.controller';
import { LicenseController } from '../modules/api/license.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('mongoUri'),
        user: configService.get('mongoUser'),
        pass: configService.get('mongoPassword'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    HealthModule,
  ],
  controllers: [AppController, ApiV1Controller, LicenseController],
  providers: [AppService],
})
export class AppModule {}
