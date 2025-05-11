import { Router } from 'itty-router';
import manifest from '@manifest';
import { jsonResponse } from '@app/utils';

// Create a router for the root endpoint
export function registerRootRoutes(router: ReturnType<typeof Router>) {
  router.get('/', () => {
    return jsonResponse({ name: manifest.name, version: manifest.version });
  });
}
