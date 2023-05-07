import type { AuthClient } from './AuthClient';

export interface GoogleAuthStrategy {
  applies(): Promise<boolean>;
  authorize(): Promise<AuthClient>;
}
