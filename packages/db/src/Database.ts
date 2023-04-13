import { CryptoVisitors } from './encryption';
import type { AggregatedRepository } from './repositories';
import {
  ConfigsRepository,
  LemmasRepository,
  SpreadsheetsRepository,
  UsersRepository,
} from './repositories';
import { Guesthouse } from './utils';

export class Database implements AggregatedRepository {
  public lemmas!: LemmasRepository;
  public configs!: ConfigsRepository;
  public users!: UsersRepository;
  public spreadsheets!: SpreadsheetsRepository;
  protected cryptoVisitors!: CryptoVisitors;
  protected guesthouse!: Guesthouse;

  constructor(protected readonly rootDirectory: string) {}

  async load() {
    this.lemmas = new LemmasRepository();
    this.configs = new ConfigsRepository();
    this.users = new UsersRepository();
    this.spreadsheets = new SpreadsheetsRepository();
    this.guesthouse = new Guesthouse(this);

    const secrets = await this.configs.secrets();
    this.cryptoVisitors = new CryptoVisitors(secrets.encryption_key);

    await this.guesthouse.accept(this.cryptoVisitors.decrypt);

    return this;
  }

  async save() {
    await this.guesthouse.accept(this.cryptoVisitors.encrypt);

    try {
      await Promise.all([
        this.configs.save(),
        this.lemmas.save(),
        this.users.save(),
        this.spreadsheets.save(),
      ]);
    } finally {
      await this.guesthouse.accept(this.cryptoVisitors.decrypt);
    }
  }
}
