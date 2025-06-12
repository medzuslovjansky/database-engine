import type { D1Database } from '@cloudflare/workers-types';

declare global {
  var __MINIFLARE_DB__: D1Database;
}
