import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PortConfigService } from './config/port.config';
import { DatabaseModule } from './config/database/database.module';

export async function bootstrap() {
  await DatabaseModule.initialize();

  const totpSecret = process.env.TOTP_SECRET;
  if (!totpSecret) {
    console.warn(`! TOTP secret is required for API authentication.`);
    console.warn(`> Generate one here: https://api.canmi.icu/v1/auth/totp-secret?length=32\n`);
    process.exit(1);
  }

  console.log(`# Loading API v1`);
  console.log(`> Authentication: TOTP`);
  console.log(`+ Secret: ${totpSecret.slice(0, 3)}${'*'.repeat(totpSecret.length - 3)}`);

  const port = process.env.PORT || 33321;
  console.log(`> Server is running on http://localhost:${port}\n`);

  const app = await NestFactory.create(AppModule);
  const portConfig = app.get(PortConfigService);
  await app.listen(portConfig.port);
}
