import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseModule } from './config/database/database.module';
import { TotpConfig } from './config/totp/totp.config';
import { PortConfig } from './config/port/port.config';
import { HttpExceptionFilter } from './utils/filter';

export async function bootstrap() {
  await DatabaseModule.initialize();

  console.log(`# Loading API v1`);
  TotpConfig.getSecret();

  const port = PortConfig.getPort();

  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(port);
}