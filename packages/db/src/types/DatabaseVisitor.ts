import type {
  Lemma,
  Secrets,
  Spreadsheet,
  User,
} from '../dto';

export interface DatabaseVisitor {
  visitSecrets?(node: Secrets): void | Promise<void>;
  visitSpreadsheet?(node: Spreadsheet): void | Promise<void>;
  visitUser?(node: User): void | Promise<void>;
  visitLemma?(node: Lemma): Promise<void>;
}
