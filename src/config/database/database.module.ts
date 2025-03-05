import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseConfigService } from './database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = new DatabaseConfigService(configService);
        dbConfig.validateConfig();
        return {
          uri: dbConfig.uri,
          user: dbConfig.user,
          pass: dbConfig.password,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseConfigService],
  exports: [DatabaseConfigService],
})
export class DatabaseModule {}
