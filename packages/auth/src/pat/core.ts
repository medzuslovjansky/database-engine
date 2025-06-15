import type { PATTokenDetailed } from './schema';



// Read-only query interface
export interface PATTokenQuery {
  listTokens(userId: string): Promise<PATTokenDetailed[]>;
}
