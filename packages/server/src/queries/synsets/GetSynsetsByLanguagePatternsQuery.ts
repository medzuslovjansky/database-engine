import { BaseQuery } from '../base';
import { PaginatedResponse, PaginationParams, calculatePagination } from '../../utils/pagination';
import { LanguageQuery, Synset } from './models';

export interface GetSynsetsByLanguagePatternsParams extends PaginationParams {
  languageQueries: LanguageQuery;
}

export class GetSynsetsByLanguagePatternsQuery extends BaseQuery<GetSynsetsByLanguagePatternsParams, PaginatedResponse<Synset>> {
  async execute({ languageQueries, page = 1, pageSize = 20 }: GetSynsetsByLanguagePatternsParams): Promise<PaginatedResponse<Synset>> {
    // Build the WHERE clause for language filtering
    let whereClause = '';
    const whereParams: any[] = [];
    let paramIndex = 1;

    Object.entries(languageQueries).forEach(([langCode, pattern]) => {
      whereClause += whereClause ? ' AND ' : '';
      whereClause += `EXISTS (
        SELECT 1 FROM meanings m2
        JOIN lemmas l2 ON m2.lemma_id = l2.id
        WHERE m2.synset_id = s.id
        AND l2.language_code = ?${paramIndex}
        AND l2.value LIKE ?${paramIndex + 1}
      )`;
      whereParams.push(langCode, pattern);
      paramIndex += 2;
    });

    // First, count total items for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM synsets s
    `;

    if (whereClause) {
      countQuery += ` WHERE ${whereClause}`;
    }

    // Prepare and execute the count query
    const countStmt = this.db.prepare(countQuery);
    whereParams.forEach((param, index) => {
      countStmt.bind(index + 1, param);
    });

    const countResult = await countStmt.first();
    const totalItems = countResult?.total as number || 0;

    // Calculate pagination values
    const { offset, limit, meta } = calculatePagination(page, pageSize, totalItems);

    // Build the main query for data retrieval
    let dataQuery = `
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
    `;

    if (whereClause) {
      dataQuery += ` WHERE ${whereClause}`;
    }

    dataQuery += ` ORDER BY s.id, m.sense_number LIMIT ? OFFSET ?`;

    // Prepare and execute the data query
    const dataStmt = this.db.prepare(dataQuery);
    whereParams.forEach((param, index) => {
      dataStmt.bind(index + 1, param);
    });

    // Bind pagination parameters
    dataStmt.bind(paramIndex, limit);
    dataStmt.bind(paramIndex + 1, offset);

    const result = await dataStmt.all();
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
