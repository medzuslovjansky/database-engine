import { GoogleServiceAccountAuthStrategy } from './GoogleServiceAccountAuthStrategy';
import { GoogleLocalAuthStrategy } from './GoogleLocalAuthStrategy';
import type { AuthClient } from './AuthClient';

export async function createAuthClient(): Promise<AuthClient> {
  const serviceAccountAuthStrategy = new GoogleServiceAccountAuthStrategy();
  if (await serviceAccountAuthStrategy.applies()) {
    return serviceAccountAuthStrategy.authorize();
  }

  const localAuthStrategy = new GoogleLocalAuthStrategy();
  if (await localAuthStrategy.applies()) {
    return localAuthStrategy.authorize();
  }

  return;
}
