import { GoogleServiceAccountAuthStrategy } from './GoogleServiceAccountAuthStrategy';
import { GoogleLocalAuthStrategy } from './GoogleLocalAuthStrategy';
import type { GoogleAuthStrategy } from './GoogleAuthStrategy';

export class GoogleAuthService {
  private readonly authStrategy: GoogleAuthStrategy;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    // TODO: make it less hardcoded
    this.authStrategy =
      env.NODE_ENV === 'production'
        ? new GoogleServiceAccountAuthStrategy()
        : new GoogleLocalAuthStrategy();
  }

  async authorize() {
    return this.authStrategy.authorize();
  }
}
