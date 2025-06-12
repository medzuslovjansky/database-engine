import type { PATTokenDetailed } from './schema';

export interface PATTokenRepository {
  createToken(tokenId: string, name: string): Promise<void>;
  deleteToken(tokenId: string): Promise<void>;
  listTokens(userId: string): Promise<PATTokenDetailed[]>;
}
