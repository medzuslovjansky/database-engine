import type { AggregatedRepository } from './repositories';
import {
  LemmasRepository,
  SpreadsheetsRepository,
  UsersRepository,
} from './repositories';
import type { PIIHelper } from './utils';

export type DatabaseConfig = {
  readonly rootDirectory: string;
  readonly piiHelper: PIIHelper;
};

export class Database implements AggregatedRepository {
  public readonly lemmas: LemmasRepository;
  public readonly users: UsersRepository;
  public readonly spreadsheets: SpreadsheetsRepository;

  constructor(config: DatabaseConfig) {
    const { rootDirectory, piiHelper } = config;

    this.lemmas = new LemmasRepository(rootDirectory);
    this.spreadsheets = new SpreadsheetsRepository(rootDirectory, piiHelper);
    this.users = new UsersRepository(rootDirectory, piiHelper);
  }
}
