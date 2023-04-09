import type { AuthClient } from './AuthClient';

export interface GoogleAuthStrategy {
  authorize(): Promise<AuthClient>;
}
