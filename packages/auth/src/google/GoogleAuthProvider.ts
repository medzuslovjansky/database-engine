import type { GoogleTokenValidator } from './GoogleTokenValidator';
import type { GoogleAuthConfig } from './GoogleAuthConfig';
import type { GoogleJwtPayload } from './GoogleJwtPayload';

export class GoogleAuthProvider {
  constructor(
    private readonly config: GoogleAuthConfig,
    private readonly tokenValidator: GoogleTokenValidator
  ) {}

  async validateToken(token: string): Promise<GoogleJwtPayload | null> {
    throw new Error('Not implemented');
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    idToken: string;
    expiresIn: number;
    refreshToken?: string;
  }> {
    throw new Error('Not implemented');
  }

  async exchangeAuthCode(
    code: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    throw new Error('Not implemented');
  }
}
