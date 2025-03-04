import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TotpService {
  generateSecret(): string {
    return speakeasy.generateSecret({ length: 20 }).base32;
  }
}
