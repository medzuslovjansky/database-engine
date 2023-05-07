import prettier from 'prettier';

import type { AggregatedRepository } from './repositories';
import {
  MultilingualSynsetRepository,
  SpreadsheetsRepository,
  UsersRepository,
} from './repositories';
import type { CryptoService } from './types';

export type FileDatabaseConfig = {
  readonly cryptoService: CryptoService;
  readonly rootDirectory: string;
  readonly prettier?: prettier.Options & { [key: string]: unknown };
};

export class FileDatabase implements AggregatedRepository {
  public readonly multisynsets: MultilingualSynsetRepository;
  public readonly users: UsersRepository;
  public readonly spreadsheets: SpreadsheetsRepository;

  constructor(config: FileDatabaseConfig) {
    const { rootDirectory, cryptoService } = config;

    this.multisynsets = new MultilingualSynsetRepository({
      rootDirectory,
      prettier: config.prettier,
    });
    this.spreadsheets = new SpreadsheetsRepository(
      rootDirectory,
      cryptoService,
    );
    this.users = new UsersRepository(rootDirectory, cryptoService);
  }

  static async create(config: FileDatabaseConfig): Promise<FileDatabase> {
    const prettierConfig = await prettier.resolveConfig(config.rootDirectory);

    return new FileDatabase({
      ...config,
      prettier: prettierConfig ?? undefined,
    });
  }
}
