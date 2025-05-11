import { jwtVerify, createRemoteJWKSet } from 'jose';

import { GoogleJwtPayload } from './GoogleJwtPayload';

/**
 * Responsible for validating JWT tokens cryptographically
 */
export class TokenValidator {
  private static instance: TokenValidator;
  private clientId: string;
  private jwks: ReturnType<typeof createRemoteJWKSet>;

  private constructor(clientId: string) {
    this.clientId = clientId;
    this.jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
  }

  public static getInstance(clientId: string): TokenValidator {
	if (!this.instance) {
		this.instance = new TokenValidator(clientId);
	}
	return this.instance;
  }

  /**
   * Validates a JWT token cryptographically using Google's JWKS
   * @param token The raw JWT token to validate
   * @returns The validated payload or null if validation failed
   */
  async validateToken(token: string): Promise<GoogleJwtPayload | null> {
    try {
		console.log('Validating token:', token);
      // Use the JWKS function, not the raw JSON
      const { payload } = await jwtVerify(
        token,
        this.jwks,
        {
          issuer: 'https://accounts.google.com',
          audience: this.clientId
        }
      );

      // Cast the payload to our interface
      return payload as unknown as GoogleJwtPayload;
    } catch (error) {
      console.error('Error validating JWT:', error);
      return null;
    }
  }
}
