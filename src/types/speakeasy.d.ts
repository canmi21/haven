declare module 'speakeasy' {
  export function generateSecret(options?: { length?: number; name?: string }): { base32: string; otpauth_url: string };
  export function totp(options: { secret: string; encoding?: string }): string;
  export function verify(options: { secret: string; token: string; encoding?: string }): boolean;
}
