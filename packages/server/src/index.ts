/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { AutoRouter } from 'itty-router';
import { registerRoutes } from '@app/routes';
import { errorResponse } from '@app/utils';
import { Projections } from '@app/projections';
import { Synset } from '@interslavic/database-engine-core';

// Create a router with middleware
const router = AutoRouter();

// Register all routes from our route modules
registerRoutes(router).all('*', () => errorResponse('Not Found', 404));

// Export the worker
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		Projections.getInstance(env.slovosbor_db);
		return router.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;

// Monorepo import demonstration (no effect on worker)
function _demoMonorepoCoreImport() {
	// Demonstrate using Synset static method
	const syn = Synset.parse('demo');
	return syn.toString();
}
