import type { ConfigsRepository } from './ConfigsRepository';
import type { LemmasRepository } from './LemmasRepository';
import type { SpreadsheetsRepository } from './SpreadsheetsRepository';
import type { UsersRepository } from './UsersRepository';

export interface AggregatedRepository {
  readonly configs: ConfigsRepository;
  readonly lemmas: LemmasRepository;
  readonly spreadsheets: SpreadsheetsRepository;
  readonly users: UsersRepository;

  save(): Promise<void>;
}
