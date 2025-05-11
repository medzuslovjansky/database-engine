import { Router } from 'itty-router';
import { RebuildProjectionsCommand } from '@app/commands';
import { requireAdmin } from '@app/middleware';
import { jsonResponse, errorResponse } from '@app/utils';
import { AuthRequest } from '@app/auth';

/**
 * Register system administration routes
 * @param router Router instance
 */
export function registerSystemRoutes(router: ReturnType<typeof Router>) {
  /**
   * Rebuild projections from events
   * POST /api/system/rebuild-projections
   */
  router.post<AuthRequest>('/api/system/rebuild-projections', requireAdmin, async (request, env) => {
    try {
      // Execute command to rebuild projections
      const command = new RebuildProjectionsCommand({ db: env.DB, user: request.user });
      await command.execute({});

      return jsonResponse({ message: 'Projections rebuilt successfully' });
    } catch (error) {
      return errorResponse(String(error), 500);
    }
  });

  return router;
}
