import { GoogleJwtPayload } from './GoogleJwtPayload';

/**
 * Responsible for extracting and decoding tokens from Authorization headers
 */
export class TokenExtractor {
  /**
   * Extracts a raw JWT token from the Authorization header
   * @param request The incoming request
   * @returns The extracted token or null if no valid header found
   */
  static extractRawToken(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.split(' ')[1];
  }

  /**
   * Extracts and decodes the JWT payload from a raw token
   * @param token The raw JWT token
   * @returns The decoded payload or null if invalid/missing
   */
  static extractPayload(token: string | null): GoogleJwtPayload | null {
    if (!token) return null;

    try {
      // Token structure: header.payload.signature
      const [, base64Payload] = token.split('.');
      if (!base64Payload) return null;

      // Decode payload (base64url to string to JSON)
      const payloadString = this.base64UrlDecode(base64Payload);
      const payload = JSON.parse(payloadString);

      return payload as GoogleJwtPayload;
    } catch (error) {
      console.error('Error decoding JWT payload:', error);
      return null;
    }
  }

  /**
   * Decodes base64url-encoded string in browser environment
   */
  private static base64UrlDecode(base64Url: string): string {
    // Convert base64url to base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64 to string (browser-compatible)
    return atob(base64);
  }
}
