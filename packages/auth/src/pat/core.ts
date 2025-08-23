import type { PATTokenDetailed } from './schema';

export interface PATTokenQuery {
  listTokens(userId: string): Promise<PATTokenDetailed[]>;
}
