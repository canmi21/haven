import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfigService {
  constructor(private readonly configService: ConfigService) {}

  get uri(): string {
    return this.configService.get<string>('MONGO_URI', '');
  }

  get user(): string {
    return this.configService.get<string>('MONGO_USER', '');
  }

  get password(): string {
    return this.configService.get<string>('MONGO_PASSWD', '');
  }

  validateConfig(): void {
    if (!this.uri || !this.user || !this.password) {
      console.error('[Mongo] Missing required environment variables.');
      process.exit(1);
    }

    if (this.password.length < 10) {
      console.warn('[Mongo] Warning: Weak password detected.');
      console.warn('[Mongo] Use "openssl rand -base64 64" to generate a strong password.\n');
      process.exit(1);
    }
  }
}
