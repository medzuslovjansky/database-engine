import { BaseQuery } from '../base';
import { PaginatedResponse, PaginationParams, calculatePagination } from '../../utils/pagination';
import { Synset } from './models';

export interface GetAllSynsetsParams extends PaginationParams {
  // Additional parameters can be added here
}

export class GetAllSynsetsQuery extends BaseQuery<GetAllSynsetsParams, PaginatedResponse<Synset>> {
  async execute({ page = 1, pageSize = 20 }: GetAllSynsetsParams): Promise<PaginatedResponse<Synset>> {
    // First, count total items for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM synsets s
    `;

    const countResult = await this.db.prepare(countQuery).first();
    const totalItems = countResult?.total as number || 0;

    // Calculate pagination values
    const { offset, limit, meta } = calculatePagination(page, pageSize, totalItems);

    // Fetch paginated results
    const dataQuery = `
      SELECT
        s.*,
        l.id as lemma_id,
        l.value,
        l.language_code,
        l.pos,
        l.source_type as lemma_source_type,
        l.source_id as lemma_source_id,
        l.metadata,
        m.sense_number,
        m.annotation
      FROM synsets s
      JOIN meanings m ON s.id = m.synset_id
      JOIN lemmas l ON m.lemma_id = l.id
      ORDER BY s.id, m.sense_number
      LIMIT ? OFFSET ?
    `;

    const result = await this.db.prepare(dataQuery).bind(limit, offset).all();
    const rawResults = result.results;

    // Process results to create proper synset objects with nested lemmas
    const synsetMap = new Map<string, Synset>();

    rawResults.forEach((row: any) => {
      // Extract synset data
      if (!synsetMap.has(row.id)) {
        synsetMap.set(row.id, {
          id: row.id,
          source_type: row.source_type,
          source_id: row.source_id,
          domain_id: row.domain_id,
          definition: row.definition,
          lemmas: []
        });
      }

      // Add lemma to synset if it exists
      const synset = synsetMap.get(row.id)!;
      synset.lemmas = synset.lemmas || [];

      synset.lemmas.push({
        id: row.lemma_id,
        value: row.value,
        language_code: row.language_code,
        pos: row.pos,
        source_type: row.lemma_source_type,
        source_id: row.lemma_source_id,
        metadata: row.metadata,
        sense_number: row.sense_number,
        annotation: row.annotation
      });
    });

    // Convert the map to an array
    const synsets = Array.from(synsetMap.values());

    // Return paginated response
    return {
      data: synsets,
      pagination: meta
    };
  }
}
