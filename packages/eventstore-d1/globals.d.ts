import type { D1Database } from '@cloudflare/workers-types';

declare global {
  // eslint-disable-next-line no-var
  var __MINIFLARE_DB__: D1Database;
}
