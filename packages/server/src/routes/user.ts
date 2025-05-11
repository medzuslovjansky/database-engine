import { Router } from 'itty-router';
import { AuthRequest, User } from '@app/auth';
import { requireAuth } from '@app/middleware';
import { jsonResponse, errorResponse } from '@app/utils';
import { UserService } from '@app/auth';
import { Role } from '@app/schema';
import { AddUserRoleCommand, RemoveUserRoleCommand } from '@app/commands';
import { FindUserQuery } from '@app/queries';

interface ChangeUserRoleRequest extends AuthRequest {
	params: {
		id: string;
	};
}

interface ChangeUserRoleRequestBody {
	role: string;
	language_code: string;
}

export function registerUserRoutes(router: ReturnType<typeof Router>) {
	// User info endpoint to show the authenticated user's details
	router.get<AuthRequest>('/api/v1/user', requireAuth, ({ user }) => {
		return jsonResponse(user);
	});

	// Get user info by ID
	router.get<ChangeUserRoleRequest, [Cloudflare.Env]>('/api/v1/user/:id', async (request, env) => {
		try {
			const userId = request.params.id;
			if (!userId) return errorResponse('Missing user id', 400);

			const user = await UserService.getInstance(env.slovosbor_db).getUserById(userId);
			if (!user) return errorResponse('User not found', 404);

			return jsonResponse(user);
		} catch (err) {
			return errorResponse(String(err), 400);
		}
	});
	// Assign a role to a user
	router.post<ChangeUserRoleRequest, [Cloudflare.Env]>('/api/v1/user/:id/roles', requireAuth, async (request, env) => {
		try {
			const userId = request.params.id;
			if (!userId) return errorResponse('Missing user id', 400);

			let body: ChangeUserRoleRequestBody;
			try {
				body = await request.json();
			} catch {
				return errorResponse('Invalid JSON body', 400);
			}
			const { role, language_code } = body;
			if (!role) return errorResponse('Missing role', 400);

			const userService = UserService.getInstance(env.slovosbor_db);
			const command = new AddUserRoleCommand({ db: env.slovosbor_db, user: request.user, userService });
			await command.execute({ user_id: userId, role: role as Role, language_code });

			return jsonResponse({ success: true });
		} catch (err) {
			return errorResponse(String(err), 400);
		}
	});

	// Remove a role from a user
	router.delete<ChangeUserRoleRequest, [Cloudflare.Env]>('/api/v1/user/:id/roles', requireAuth, async (request, env) => {
		try {
			const userId = request.params.id;
			if (!userId) return errorResponse('Missing user id', 400);

			let body: ChangeUserRoleRequestBody;
			try {
				body = await request.json();
			} catch {
				return errorResponse('Invalid JSON body', 400);
			}
			const { role, language_code } = body;
			if (!role) return errorResponse('Missing role', 400);

			const userService = UserService.getInstance(env.slovosbor_db);
			const command = new RemoveUserRoleCommand({ db: env.slovosbor_db, user: request.user, userService });
			await command.execute({ user_id: userId, role: role as Role, language_code });

			return jsonResponse({ success: true });
		} catch (err) {
			return errorResponse(String(err), 400);
		}
	});

}
