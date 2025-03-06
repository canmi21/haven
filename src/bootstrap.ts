import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PortConfigService } from './config/port.config';
import { DatabaseModule } from './config/database/database.module';
import { TotpConfig } from './config/totp/totp.config';

export async function bootstrap() {
  await DatabaseModule.initialize();

  console.log(`# Loading API v1`);
  TotpConfig.getSecret();
  
  const port = process.env.PORT || 33321;
  console.log(`> Server is running on http://localhost:${port}\n`);

  const app = await NestFactory.create(AppModule);
  const portConfig = app.get(PortConfigService);
  await app.listen(portConfig.port);
}
