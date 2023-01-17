import { GoogleServiceAccountAuthStrategy } from './GoogleServiceAccountAuthStrategy';
import { GoogleLocalAuthStrategy } from './GoogleLocalAuthStrategy';
import { GoogleAuthStrategy } from './GoogleAuthStrategy';

export class GoogleAuthService {
  private readonly authStrategy: GoogleAuthStrategy;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    if (env.NODE_ENV === 'production') {
      this.authStrategy = new GoogleServiceAccountAuthStrategy();
    } else {
      this.authStrategy = new GoogleLocalAuthStrategy();
    }
  }

  async authorize() {
    return this.authStrategy.authorize();
  }
}
