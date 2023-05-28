import { GoogleServiceAccountAuthStrategy } from './GoogleServiceAccountAuthStrategy';
import { GoogleLocalAuthStrategy } from './GoogleLocalAuthStrategy';
import type { AuthClient } from './AuthClient';

export async function createAuthClient(cwd?: string): Promise<AuthClient> {
  const serviceAccountAuthStrategy = new GoogleServiceAccountAuthStrategy(cwd);
  if (await serviceAccountAuthStrategy.applies()) {
    return serviceAccountAuthStrategy.authorize();
  }

  const localAuthStrategy = new GoogleLocalAuthStrategy(cwd);
  if (await localAuthStrategy.applies()) {
    return localAuthStrategy.authorize();
  }

  return;
}
