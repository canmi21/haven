import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PortConfigService {
  constructor(private readonly configService: ConfigService) {}

  get port(): number {
    return this.configService.get<number>('PORT', 33321);
  }
}
