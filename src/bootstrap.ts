import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectRedis } from './config/database/redis';
import { connectMongo } from './config/database/mongo';
import { TotpConfig } from './config/totp/totp.config';
import { PortConfig } from './config/port/port.config';
import { HttpExceptionFilter } from './utils/filter';
import { initSubscriptionDB } from './config/database/subscription-db';

export async function bootstrap() {
  await connectRedis();
  await connectMongo();

  console.log(`# Loading API v1`);
  TotpConfig.getSecret();

  await initSubscriptionDB();

  const port = PortConfig.getPort();
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(port);
}
