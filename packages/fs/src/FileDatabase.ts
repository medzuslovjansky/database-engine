import type { AggregatedRepository } from './repositories';
import {
  MultilingualSynsetRepository,
  SpreadsheetsRepository,
  UsersRepository,
} from './repositories';
import type { CryptoService } from './types';

export type FileDatabaseConfig = {
  readonly rootDirectory: string;
  readonly cryptoService: CryptoService;
};

export class FileDatabase implements AggregatedRepository {
  public readonly multisynsets: MultilingualSynsetRepository;
  public readonly users: UsersRepository;
  public readonly spreadsheets: SpreadsheetsRepository;

  constructor(config: FileDatabaseConfig) {
    const { rootDirectory, cryptoService } = config;

    this.multisynsets = new MultilingualSynsetRepository(rootDirectory);
    this.spreadsheets = new SpreadsheetsRepository(
      rootDirectory,
      cryptoService,
    );
    this.users = new UsersRepository(rootDirectory, cryptoService);
  }
}
