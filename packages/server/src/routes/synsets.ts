import { Router } from 'itty-router';
import { AuthRequest } from '@app/auth';
import { GetAllSynsetsQuery, GetSynsetsByLanguagePatternsQuery, LanguageQuery } from '@app/queries';
import { errorResponse, jsonResponse } from '@app/utils';

export interface SynsetsRequest extends AuthRequest {
	query?: Partial<{
		page: string;
		pageSize: string;
		q: string;
	}>;
}

export function registerSynsetsRoutes(router: ReturnType<typeof Router>) {
	router.get<SynsetsRequest, [Cloudflare.Env]>('/api/v1/synsets', async (request, env) => {
		const { query = {}, url } = request;
		const authRequest = request as AuthRequest;

		console.log('Synsets endpoint hit', { url, userEmail: authRequest.user?.email });

		try {
			// Parse pagination parameters from query
			const page = parseInt(query.page || '1', 10);
			const pageSize = parseInt(query.pageSize || '20', 10);
			const queryParam = query.q || '';

			console.log('Query parameters:', {
				queryParam,
				page,
				pageSize,
				hasDb: !!env.slovosbor_db
			});

			if (!queryParam) {
				// If no query is provided, return all synsets (paginated)
				console.log('Getting all synsets');
				const getAllQuery = new GetAllSynsetsQuery(env.slovosbor_db);
				const synsets = await getAllQuery.execute({ page, pageSize });
				console.log(`Found ${synsets.data.length} synsets`);
				return jsonResponse(synsets);
			}

			// Parse the JSON query parameter
			let languageQueries: LanguageQuery;
			try {
				languageQueries = JSON.parse(queryParam);
				console.log('Parsed language queries:', languageQueries);
			} catch (e) {
				console.error('Error parsing language queries:', e);
				return errorResponse('Invalid query format. Expected JSON with language codes as keys and LIKE patterns as values', 400);
			}

			// Get results with language filters (paginated)
			console.log('Getting synsets with language filters');
			const languageFilterQuery = new GetSynsetsByLanguagePatternsQuery(env.slovosbor_db);
			const results = await languageFilterQuery.execute({
				languageQueries,
				page,
				pageSize
			});

			console.log(`Found ${results.data.length} filtered synsets`);
			return jsonResponse(results);
		} catch (error) {
			console.error('Error querying synsets:', error);
			return errorResponse('Internal server error', 500);
		}
	});
}
