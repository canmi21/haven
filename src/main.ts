import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';
import { testMongoConnection } from './config/database.config';

dotenv.config();

async function bootstrap() {
  await testMongoConnection();
  const app = await NestFactory.create(AppModule);
  await app.listen(33321);
}

bootstrap();
