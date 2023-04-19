import type { LemmasRepository } from './LemmasRepository';
import type { SpreadsheetsRepository } from './SpreadsheetsRepository';
import type { UsersRepository } from './UsersRepository';

export interface AggregatedRepository {
  readonly lemmas: LemmasRepository;
  readonly spreadsheets: SpreadsheetsRepository;
  readonly users: UsersRepository;
}
