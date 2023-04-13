import type { AggregatedRepository } from '../repositories';
import type { DatabaseVisitor } from '../types';

export class Guesthouse {
  constructor(protected readonly repository: AggregatedRepository) {}

  async accept(visitor: DatabaseVisitor): Promise<this> {
    if (visitor.visitSecrets) {
      await visitor.visitSecrets(await this.repository.configs.secrets());
    }

    if (visitor.visitUser) {
      await this.repository.users.all.forEach(visitor.visitUser);
    }

    if (visitor.visitSpreadsheet) {
      await this.repository.spreadsheets.all.forEach(visitor.visitSpreadsheet);
    }

    if (visitor.visitLemma) {
      await this.repository.lemmas.all.forEach(visitor.visitLemma);
    }

    return this;
  }
}
