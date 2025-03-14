export class TotpConfig {
    public static getSecret(): string {
      const totpSecret = process.env.TOTP_SECRET;
      if (!totpSecret) {
        console.warn(`! TOTP secret is required for API authentication.`);
        console.warn(`> Generate one here https://canmi.icu/api/v1/auth/totp-secret?length=32\n`);
        process.exit(1);
      }
      console.log(`> Authentication: TOTP`);
      console.log(`+ Secret: ${totpSecret.slice(0, 3)}${'*'.repeat(totpSecret.length - 3)}`);
      return totpSecret;
    }
  }
  