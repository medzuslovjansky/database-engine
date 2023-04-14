import { MultiFileRepository } from '../fs';
import type { Secrets } from '../dto';

export class ConfigsRepository extends MultiFileRepository<string, any> {
  secrets(): Promise<Secrets> {
    return this.findById('secrets')!;
  }
}
