import type { AuthProvider } from '@auth/core';
import type { UserProfileDTO } from '@auth/schema';

export class AuthService {
  private readonly providers = new Map<string, AuthProvider>();

  constructor() {}

  registerProvider<Request>(providerType: string, provider: AuthProvider<Request>): void {
    this.providers.set(providerType, provider);
  }

  async authenticate(request: unknown): Promise<UserProfileDTO | null> {
    for (const provider of this.providers.values()) {
      if (provider.canHandle(request)) {
        try {
          return await provider.authenticate(request);
        } catch (error) {
          console.error('Authentication failed:', error);
          throw new Error('Authentication failed', { cause: error });
        }
      }
    }

    return null;
  }
}
