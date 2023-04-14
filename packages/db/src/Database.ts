import { join } from 'node:path';

import { CryptoVisitors } from './encryption';
import type {
  AggregatedRepository,
  ConfigsRepository,
  SpreadsheetsRepository,
  UsersRepository,
} from './repositories';
import { LemmasRepository } from './repositories';
import { Guesthouse } from './utils';

export class Database implements AggregatedRepository {
  public readonly lemmas: LemmasRepository;
  public configs!: ConfigsRepository;
  public users!: UsersRepository;
  public spreadsheets!: SpreadsheetsRepository;
  protected cryptoVisitors!: CryptoVisitors;
  protected guesthouse!: Guesthouse;

  constructor(protected readonly rootDirectory: string) {
    this.lemmas = new LemmasRepository(join(this.rootDirectory, 'lemmas'));
    this.guesthouse = new Guesthouse(this);
  }

  async load() {
    // this.configs = new ConfigsRepository();
    // this.users = new UsersRepository();
    // this.spreadsheets = new SpreadsheetsRepository();

    const secrets = await this.configs.secrets();
    this.cryptoVisitors = new CryptoVisitors(secrets.encryption_key);

    await this.guesthouse.accept(this.cryptoVisitors.decrypt);

    return this;
  }

  async save() {
    // TODO: think now how to encrypt/decrpypt via serialization
    await this.guesthouse.accept(this.cryptoVisitors.encrypt);
    await this.guesthouse.accept(this.cryptoVisitors.decrypt);
  }
}
