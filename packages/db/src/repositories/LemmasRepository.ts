import { MultiFileRepository } from '../fs';
import type { Lemma } from '../dto';

export class LemmasRepository extends MultiFileRepository<number, Lemma> {}
