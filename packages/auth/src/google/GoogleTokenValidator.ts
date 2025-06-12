import type { GoogleJwtPayload } from './GoogleJwtPayload';

export class GoogleTokenValidator {
  constructor(private readonly clientId: string) {}

  async validate(token: string): Promise<GoogleJwtPayload | null> {
    throw new Error('Not implemented');
  }
}
