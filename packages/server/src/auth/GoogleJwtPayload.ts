/**
 * Interface for JWT payload from Google
 * @see https://developers.google.com/identity/sign-in/web/backend-auth
 */
export interface GoogleJwtPayload {
  iss: string;
  sub: string;
  azp: string;
  aud: string;
  iat: number;
  exp: number;

  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

export type GoogleJwtPayloadWithUserInfo = Required<GoogleJwtPayload>;