import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TotpService {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.TOTP_SECRET as string;
  }

  verify(token: string): boolean {
    return speakeasy.totp.verify({
      secret: this.secret,
      encoding: 'base32',
      token: token,
      window: 1,// accept 30s token
    });
  }
}
