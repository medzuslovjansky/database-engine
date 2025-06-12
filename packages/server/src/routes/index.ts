import { IttyRouter } from 'itty-router';
import { registerAuthRoutes } from './auth';
import { registerRootRoutes } from './root';
import { registerSynsetsRoutes } from './synsets';
import { registerUserRoutes } from './user';
import { registerSystemRoutes } from './system';

// Helper function to add routes to a router
export function registerRoutes(router: ReturnType<typeof IttyRouter>) {
  registerAuthRoutes(router);
  registerRootRoutes(router);
  registerSynsetsRoutes(router);
  registerUserRoutes(router);
  registerSystemRoutes(router);
  return router;
}
