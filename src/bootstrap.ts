import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PortConfigService } from './config/port.config';
import { getFormattedTimestamp } from './utils/timestamp';

console.log(`> TARGET: MongoDB`);
console.log(`+ URI: ${process.env.MONGO_URI}`);
const password = process.env.MONGO_PASSWD;
if (password && password.length < 10) {
  console.warn(`! Please ensure your password is strong enough.`);
  console.warn(`> Try using "openssl rand -base64 64" to generate a secure password.\n`);
  process.exit(1);
}
console.log(`+ User: ${process.env.MONGO_USER}`);
console.log(`+ Password: ${password ? `${password.slice(0, 3)}${'*'.repeat(password.length - 3)}` : 'Not provided'}`);

const port = process.env.PORT || 33321; 
console.log(`> Server is running on http://localhost:${port}\n`);

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const portConfig = app.get(PortConfigService);
  const port = portConfig.port;

  await app.listen(port);
}
