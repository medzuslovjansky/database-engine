import { GoogleJwtPayload } from './GoogleJwtPayload';
import { User } from './User';

/**
 * Extension to Request object with authentication data
 */
export interface AuthRequest extends Request {
  // Raw JWT payload from Google authentication
  jwt?: GoogleJwtPayload;

  // Our domain model User with roles (after DB lookup)
  user?: User;
}
