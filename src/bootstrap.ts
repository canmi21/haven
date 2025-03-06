import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PortConfigService } from './config/port.config';
import { DatabaseModule } from './config/database/database.module';

export async function bootstrap() {
  await DatabaseModule.initialize();

  const app = await NestFactory.create(AppModule);
  const portConfig = app.get(PortConfigService);
  const port = portConfig.port;

  console.log(`> Server is running on http://localhost:${port}\n`);
  await app.listen(port);
}
