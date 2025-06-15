import {describe, it, expect, beforeAll} from 'vitest';
import type { UserProfileDTO } from '@auth/schema';
import type { UnitOfWork, AuthProviderLinkStager } from '@auth/core';

import { setupTestContext, type TestContext } from './test-setup';

describe('D1AuthProviderLink Integration', () => {
  let ctx: TestContext;
  let unitOfWork: UnitOfWork;
  let authProviderLinkStager: AuthProviderLinkStager;

  const MAIN_USER_ID = 'user123';
  const MAIN_PROVIDER_ID = 'google123';
  const MULTI_USER_ID = 'user999';

  beforeAll(async () => {
    ctx = await setupTestContext();

    // Create test users once for all tests
    const { unitOfWork: setupUoW, userProfileStager: setupStager } = ctx.createStagers();

    // Create main test user
    const mainUser: UserProfileDTO = {
      id: MAIN_USER_ID,
      display_name: 'Test User',
      email: `${MAIN_USER_ID}@example.com`,
    };
    setupStager.createUserProfile(mainUser);

    // Create multi-provider test user
    const multiUser: UserProfileDTO = {
      id: MULTI_USER_ID,
      display_name: 'Multi Provider User',
      email: `${MULTI_USER_ID}@example.com`,
    };
    setupStager.createUserProfile(multiUser);

    await setupUoW.commit();
  });

  beforeEach(() => {
    const stagers = ctx.createStagers();
    unitOfWork = stagers.unitOfWork;
    authProviderLinkStager = stagers.authProviderLinkStager;
  });

  it('should return null when finding non-existent provider', async () => {
    const result = await ctx.authProviderLinkQuery.findUserIdByProviderId('google', 'nonexistent');
    expect(result).toBeNull();
  });

  it('should return empty array for user with no providers', async () => {
    const result = await ctx.authProviderLinkQuery.findLinksByUserId('nonexistent');
    expect(result).toEqual([]);
  });

  it('should link auth provider connection to existing user', async () => {
    // Link the provider using stager pattern (user already created in beforeAll)
    authProviderLinkStager.linkAuthProvider('google', MAIN_PROVIDER_ID, MAIN_USER_ID);
    await unitOfWork.commit();

    // Find by provider ID using query
    const foundUserId = await ctx.authProviderLinkQuery.findUserIdByProviderId('google', MAIN_PROVIDER_ID);
    expect(foundUserId).toBe(MAIN_USER_ID);

    // Find by user ID using query
    const providerLinks = await ctx.authProviderLinkQuery.findLinksByUserId(MAIN_USER_ID);
    expect(providerLinks).toHaveLength(1);
    expect(providerLinks[0]).toMatchObject({
      provider_type: 'google',
      provider_id: MAIN_PROVIDER_ID,
      user_id: MAIN_USER_ID
    });
  });

  it('should update last login timestamp for existing provider link', async () => {
    // Get initial timestamp using query (from previous test)
    const initialLinks = await ctx.authProviderLinkQuery.findLinksByUserId(MAIN_USER_ID);
    const initialTimestamp = initialLinks[0].last_login_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Login (which should update last_login_at) using query + stager pattern
    const loginUserId = await ctx.authProviderLinkQuery.findUserIdByProviderId('google', MAIN_PROVIDER_ID);
    expect(loginUserId).toBe(MAIN_USER_ID);

    authProviderLinkStager.updateLastLogin('google', MAIN_PROVIDER_ID);
    await unitOfWork.commit();

    // Verify timestamp was updated using query
    const updatedLinks = await ctx.authProviderLinkQuery.findLinksByUserId(MAIN_USER_ID);
    expect(updatedLinks[0].last_login_at).toBeGreaterThan(initialTimestamp!);
  });

  it('should unlink the existing auth provider connection', async () => {
    // Verify it exists using query (from previous tests)
    expect(await ctx.authProviderLinkQuery.findUserIdByProviderId('google', MAIN_PROVIDER_ID)).toBe(MAIN_USER_ID);

    // Unlink it using stager pattern
    authProviderLinkStager.unlinkAuthProvider('google', MAIN_PROVIDER_ID);
    await unitOfWork.commit();

    // Verify it's gone using queries
    expect(await ctx.authProviderLinkQuery.findUserIdByProviderId('google', MAIN_PROVIDER_ID)).toBeNull();
    expect(await ctx.authProviderLinkQuery.findLinksByUserId(MAIN_USER_ID)).toHaveLength(0);
  });

  it('should create multiple provider links and delete all for existing user', async () => {
    // Create multiple provider links using stager pattern (user already created in beforeAll)
    authProviderLinkStager.linkAuthProvider('google', 'google999', MULTI_USER_ID);
    authProviderLinkStager.linkAuthProvider('pat', 'a5510af', MULTI_USER_ID);
    await unitOfWork.commit();

    // Verify links exist using query
    const links = await ctx.authProviderLinkQuery.findLinksByUserId(MULTI_USER_ID);
    expect(links).toHaveLength(2);

    // Delete all links for user using stager pattern
    authProviderLinkStager.deleteAuthProviderLinksByUserId(MULTI_USER_ID);
    await unitOfWork.commit();

    // Verify all links are gone using query
    const remainingLinks = await ctx.authProviderLinkQuery.findLinksByUserId(MULTI_USER_ID);
    expect(remainingLinks).toHaveLength(0);
  });
});
