import {describe, it, expect, beforeAll} from 'vitest';
import { D1Consts } from '@auth/d1';
import type { UserProfileDTO } from '@auth/schema';
import type { UnitOfWork, AuthProviderLinkStager, PATTokenStager } from '@auth/core';

import { setupTestContext, type TestContext } from './test-setup';

describe('D1PATTokenRepository', () => {
  let ctx: TestContext;
  let unitOfWork: UnitOfWork;
  let authProviderLinkStager: AuthProviderLinkStager;
  let patTokenStager: PATTokenStager;

  const MAIN_USER_ID = 'user123';
  const SECOND_USER_ID = 'user456';

  beforeAll(async () => {
    ctx = await setupTestContext();

    // Create test users once for all tests
    const { unitOfWork, userProfileStager } = ctx.createStagers();

    const mainUser: UserProfileDTO = {
      id: MAIN_USER_ID,
      display_name: 'Main Test User',
      email: `${MAIN_USER_ID}@example.com`,
    };
    userProfileStager.createUserProfile(mainUser);

    const secondUser: UserProfileDTO = {
      id: SECOND_USER_ID,
      display_name: 'Second Test User',
      email: `${SECOND_USER_ID}@example.com`,
    };
    userProfileStager.createUserProfile(secondUser);

    await unitOfWork.commit();
  });

  beforeEach(() => {
    const stagers = ctx.createStagers();
    unitOfWork = stagers.unitOfWork;
    authProviderLinkStager = stagers.authProviderLinkStager;
    patTokenStager = stagers.patTokenStager;
  });

  it('should return empty array for user with no tokens', async () => {
    const result = await ctx.patTokenQuery.listTokens('nonexistent');
    expect(result).toEqual([]);
  });

  it('should create and list PAT tokens using stagers', async () => {
    const tokenName = 'Test Token';
    const tokenId = 'test-token-id';

    await createPATToken(tokenId, tokenName, MAIN_USER_ID);

    const userTokens = await ctx.patTokenQuery.listTokens(MAIN_USER_ID);
    expect(userTokens).toHaveLength(1);
    expectTokenToMatch(userTokens[0], tokenName, tokenId, MAIN_USER_ID);
  });

  it('should add multiple PAT tokens to existing user using stagers', async () => {
    const firstTokenName = 'First Token';
    const extraTokenName = 'Extra Token';
    const firstTokenId = 'first-token-id';
    const extraTokenId = 'extra-token-id';

    await createPATToken(firstTokenId, firstTokenName, MAIN_USER_ID);
    await createPATToken(extraTokenId, extraTokenName, MAIN_USER_ID);

    const userTokens = await ctx.patTokenQuery.listTokens(MAIN_USER_ID);
    expect(userTokens.length).toBeGreaterThanOrEqual(2);

    const firstToken = findTokenByName(userTokens, firstTokenName);
    const extraToken = findTokenByName(userTokens, extraTokenName);

    expectTokenToMatch(firstToken, firstTokenName, firstTokenId, MAIN_USER_ID);
    expectTokenToMatch(extraToken, extraTokenName, extraTokenId, MAIN_USER_ID);
  });

  it('should delete PAT tokens using stagers', async () => {
    const rawToken = 'pat456';
    const tokenName = 'Token to Delete';
    const pepperedTokenHash = ctx.pepper.pepper(rawToken);

    await createPATToken(pepperedTokenHash, tokenName, SECOND_USER_ID);

    // Verify it exists
    const tokensBeforeDelete = await ctx.patTokenQuery.listTokens(SECOND_USER_ID);
    expect(tokensBeforeDelete).toHaveLength(1);

    // Delete the token using stager
    patTokenStager.unregisterToken(pepperedTokenHash);
    await unitOfWork.commit();

    // Verify it's gone (the token record is gone, but provider link might remain)
    const rawTokenRow = await ctx.db.prepare(`SELECT * FROM ${D1Consts.PAT_TOKENS_TABLE_NAME} WHERE id = ?`).bind(pepperedTokenHash).first();
    expect(rawTokenRow).toBeNull();
  });

  it('should create token with proper metadata using stagers', async () => {
    const tokenName = 'Metadata Test Token';
    const tokenId = 'metadata-token-id';

    await createPATToken(tokenId, tokenName, MAIN_USER_ID);

    const userTokens = await ctx.patTokenQuery.listTokens(MAIN_USER_ID);
    expect(userTokens.length).toBeGreaterThan(0);

    const token = findTokenByName(userTokens, tokenName);
    expectTokenToMatch(token, tokenName, tokenId, MAIN_USER_ID);
    expect(token.created_at).toBeTypeOf('number');
    expect(token.last_login_at).toBeTypeOf('number');
  });

  it('should handle tokens for different users using stagers', async () => {
    const token1Name = 'User1 Token';
    const token2Name = 'User2 Token';
    const token1Id = 'user1-token-id';
    const token2Id = 'user2-token-id';

    await createPATToken(token1Id, token1Name, MAIN_USER_ID);
    await createPATToken(token2Id, token2Name, SECOND_USER_ID);

    const user1Tokens = await ctx.patTokenQuery.listTokens(MAIN_USER_ID);
    const user2Tokens = await ctx.patTokenQuery.listTokens(SECOND_USER_ID);

    expect(user1Tokens.length).toBeGreaterThan(0);
    expect(user2Tokens.length).toBeGreaterThan(0);

    const user1Token = findTokenByName(user1Tokens, token1Name);
    const user2Token = findTokenByName(user2Tokens, token2Name);

    expectTokenToMatch(user1Token, token1Name, token1Id, MAIN_USER_ID);
    expectTokenToMatch(user2Token, token2Name, token2Id, SECOND_USER_ID);
  });

  // Helper functions
  async function createPATToken(tokenId: string, tokenName: string, userId: string): Promise<void> {
    authProviderLinkStager.linkAuthProvider('pat', tokenId, userId);
    patTokenStager.registerToken(tokenId, tokenName);
    await unitOfWork.commit();
  }

  function findTokenByName(tokens: any[], tokenName: string) {
    return tokens.find((t) => t.token_name === tokenName);
  }

  function expectTokenToMatch(token: any, tokenName: string, tokenId: string, userId: string): void {
    expect(token).toMatchObject({
      token_name: tokenName,
      user_id: userId,
      provider_type: 'pat',
      provider_id: tokenId
    });
  }
});
