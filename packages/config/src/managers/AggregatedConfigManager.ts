import type { AggregatedConfig } from '../dto';

import { SecretsManager } from './SecretsManager';
import { UsersManager } from './UsersManager';
import { SpreadsheetsManager } from './SpreadsheetsManager';

export class AggregatedConfigManager {
  public readonly secrets = new SecretsManager(this);
  public readonly users = new UsersManager(this);
  public readonly spreadsheets = new SpreadsheetsManager(this);

  constructor(public readonly config: AggregatedConfig) {}
}
