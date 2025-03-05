import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PortConfigService } from './config/port.config';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const portConfig = app.get(PortConfigService);
  const port = portConfig.port;

  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
