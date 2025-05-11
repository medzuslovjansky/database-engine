import { RequestHandler } from 'itty-router';
import { AuthRequest, TokenExtractor, TokenValidator, UserService } from '@app/auth';
import { LoginUserCommand, UpdateLastLoginCommand } from '@app/commands';
import * as errors from '@app/errors';
import { Role } from '@app/schema';
import { errorResponse } from '@app/utils';

/**
 * All-in-one authentication middleware
 *
 * This middleware handles:
 * 1. JWT extraction and validation (optional)
 * 2. User loading/creation (optional)
 * 3. Role checking (optional)
 */
export const auth = (options?: {
	role?: Role;
	languageCode?: string;
}): RequestHandler<AuthRequest, [Cloudflare.Env]> => {
	return async (request, env) => {
		const authRequest = request as AuthRequest;

		// Extract token first
		const token = TokenExtractor.extractRawToken(request);

		// If authentication is required but no token, return error
		if (!token) {
			return errorResponse(errors.MISSING_OR_INVALID_TOKEN, 401);
		}

		try {
			// Create validator with environment config
			const clientId = env.GOOGLE_CLIENT_ID;
			const tokenValidator = TokenValidator.getInstance(clientId);

			console.log('token', token);
			const payload2 = TokenExtractor.extractPayload(token);
			console.log('payload2', payload2);

			const tokenInfo = await tokenValidator.validateToken(token);

			if (!tokenInfo) {
				return errorResponse(errors.INVALID_TOKEN, 401);
			}

			if (!tokenInfo.email) {
				return errorResponse(errors.EMAIL_NOT_VERIFIED, 401);
			}

			// Add the jwt info to the request object for later use
			authRequest.jwt = tokenInfo;

			// Load or create user if we have valid JWT
			if (tokenInfo.email) {
				const email = tokenInfo.email;

				try {
					// Initialize services with the database
					const userService = UserService.getInstance(env.slovosbor_db);

					// Check cache first
					let user = await userService.getCachedUserByEmail(email);
					if (!user) {
						user = await userService.getUserByEmail(email);

						if (!user) {
							// If not found, create a new user
							const displayName = tokenInfo.name || email.split('@')[0];

							// Login user using command (creates if needed)
							const loginUserCmd = new LoginUserCommand({ db: env.slovosbor_db, userService });
							await loginUserCmd.execute({ email, display_name: displayName });

							user = await userService.getUserByEmail(email);
						} else {
							// Update last login time
							const updateLastLoginCmd = new UpdateLastLoginCommand({ db: env.slovosbor_db, user });
							await updateLastLoginCmd.execute({});
						}

						if (!user) {
							return errorResponse('User not found after creation', 500);
						}
					}

					// Store in request
					authRequest.user = user;

					// Now check role if specified
					if (options?.role) {
						if (!user.hasRole(options.role, options.languageCode)) {
							return errorResponse(`Insufficient permissions: Requires ${options.role} role`, 403);
						}
					}
				} catch (error) {
					console.error('Error loading user:', error);
					return errorResponse('Error authenticating user', 500);
				}
			}
		} catch (error) {
			console.error('Error verifying JWT:', error);
			return errorResponse('Unauthorized - Invalid token', 401);
		}
	};
};

// Shorthand for required authentication without role check
export const requireAuth: RequestHandler<AuthRequest, [Cloudflare.Env]> = (request, env) =>
	auth({})(request, env);

// Shorthand for requiring admin role
export const requireAdmin: RequestHandler<AuthRequest, [Cloudflare.Env]> = (request, env) =>
	auth({ role: 'admin' })(request, env);

// Shorthand for requiring language curator role
export const requireLanguageCurator = (languageCode: string): RequestHandler<AuthRequest, [Cloudflare.Env]> => (request, env) =>
	auth({ role: 'language_curator', languageCode })(request, env);

// For role assignment permissions (admin OR language curator)
export const requireRoleAssignmentPermission = (languageCode: string): RequestHandler<AuthRequest, [Cloudflare.Env]> => {
	return async (request, env) => {
		// First ensure the user is authenticated
		const authResponse = await auth({})(request, env);
		if (authResponse) return authResponse;

		const user = request.user!;
		// Admin can assign any roles
		const isAdmin = user.hasRole('admin');
		if (isAdmin) return;

		// Language curator can assign roles for their language
		const isLanguageCurator = user.hasRole('language_curator', languageCode);

		if (!isLanguageCurator) {
			return errorResponse(
				`Insufficient permissions: Cannot assign roles for language ${languageCode}`,
				403
			);
		}
	};
};
