import type { MultilingualSynsetRepository } from './MultilingualSynsetRepository';
import type { SpreadsheetsRepository } from './SpreadsheetsRepository';
import type { UsersRepository } from './UsersRepository';

export interface AggregatedRepository {
  readonly multisynsets: MultilingualSynsetRepository;
  readonly spreadsheets: SpreadsheetsRepository;
  readonly users: UsersRepository;
}
