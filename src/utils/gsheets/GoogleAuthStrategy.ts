import { Auth } from 'googleapis';

export interface GoogleAuthStrategy {
  authorize(): Promise<Auth.AuthClient>;
}
