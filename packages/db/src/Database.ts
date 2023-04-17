import type {
  AggregatedRepository,
  ConfigsRepository,
  SpreadsheetsRepository,
  UsersRepository,
} from './repositories';
import { LemmasRepository } from './repositories';
import { CrossEntityOperations } from './utils';

export class Database implements AggregatedRepository {
  public readonly lemmas: LemmasRepository;
  public configs!: ConfigsRepository;
  public users!: UsersRepository;
  public spreadsheets!: SpreadsheetsRepository;
  protected guesthouse!: CrossEntityOperations;

  constructor(protected readonly rootDirectory: string) {
    this.lemmas = new LemmasRepository(this.rootDirectory);
    this.guesthouse = new CrossEntityOperations(this);
  }
}
