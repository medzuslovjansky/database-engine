import { describe, it, expect, beforeEach } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import {
  D1UserProfileRepository,
  D1AuthProviderLinkRepository,
  D1PATTokenRepository,
  D1UnitOfWork,
} from '../src/d1';
import { D1AuthMigrations } from '../src/d1/migrations';
import { DefaultDateTimeProvider } from '../src/utils';
import type { UserProfileDTO, AuthProviderLinkDTO } from '../src/schema';
import {
  AUTH_PROVIDERS_TABLE_NAME,
  PAT_TOKENS_TABLE_NAME,
  USER_PROFILES_TABLE_NAME,
} from '../src/d1/consts';

describe('D1 Auth Repositories Integration Suite', () => {
  let db: D1Database;
  let userProfileRepo: D1UserProfileRepository;
  let authProviderRepo: D1AuthProviderLinkRepository;
  let patTokenRepo: D1PATTokenRepository;
  let unitOfWork: D1UnitOfWork;
  let dateTimeProvider: DefaultDateTimeProvider;

  beforeEach(async () => {
    db = globalThis.__MINIFLARE_DB__;

    // Clear tables before each test to ensure isolation
    const migrations = new D1AuthMigrations({
      db,
      migrationsTableName: 'migrations'
    });
    await migrations.reset();

    // Initialize dependencies
    dateTimeProvider = new DefaultDateTimeProvider();
    unitOfWork = new D1UnitOfWork({ db });

    // Initialize repositories
    userProfileRepo = new D1UserProfileRepository({
      db,
      tableName: USER_PROFILES_TABLE_NAME,
      unitOfWork,
      dateTimeProvider,
    });

    authProviderRepo = new D1AuthProviderLinkRepository({
      db,
      tableName: AUTH_PROVIDERS_TABLE_NAME,
      unitOfWork,
      dateTimeProvider,
    });

    patTokenRepo = new D1PATTokenRepository({
      db,
      tokensTableName: PAT_TOKENS_TABLE_NAME,
      providersTableName: AUTH_PROVIDERS_TABLE_NAME,
      unitOfWork,
      dateTimeProvider,
    });
  });

  describe('D1UserProfileRepository', () => {
    it('should create and find a user profile', async () => {
      const now = new Date();
      const testProfile: UserProfileDTO = {
        id: 'user123',
        display_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        email: 'test@example.com',
        last_login_at: now,
      };

      // Create the profile
      await userProfileRepo.create(testProfile);
      await unitOfWork.commit();

      // Verify it was created
      const foundProfile = await userProfileRepo.findById('user123');
      expect(foundProfile).not.toBeNull();
      expect(foundProfile!.id).toBe('user123');
      expect(foundProfile!.display_name).toBe('Test User');
      expect(foundProfile!.avatar_url).toBe('https://example.com/avatar.jpg');
      expect(foundProfile!.email).toBe('test@example.com');
      expect(foundProfile!.last_login_at).toEqual(now);

      console.log('\n==== USER PROFILE IN DATABASE ====');
      const rawProfile = await db.prepare(`SELECT * FROM ${USER_PROFILES_TABLE_NAME}`).first();
      console.log(JSON.stringify(rawProfile, null, 2));
    });

    it('should update an existing user profile', async () => {
      const originalProfile: UserProfileDTO = {
        id: 'user456',
        display_name: 'Original Name',
        email: 'original@example.com',
      };

      // Create the profile
      await userProfileRepo.create(originalProfile);
      await unitOfWork.commit();

      // Update the profile
      const updatedProfile: UserProfileDTO = {
        id: 'user456',
        display_name: 'Updated Name',
        avatar_url: 'https://example.com/new-avatar.jpg',
        email: 'updated@example.com',
        last_login_at: new Date(),
      };

      await userProfileRepo.update(updatedProfile);
      await unitOfWork.commit();

      // Verify the update
      const foundProfile = await userProfileRepo.findById('user456');
      expect(foundProfile!.display_name).toBe('Updated Name');
      expect(foundProfile!.avatar_url).toBe('https://example.com/new-avatar.jpg');
      expect(foundProfile!.email).toBe('updated@example.com');
    });

    it('should remove a user profile', async () => {
      const testProfile: UserProfileDTO = {
        id: 'user789',
        display_name: 'To Be Deleted',
      };

      // Create the profile
      await userProfileRepo.create(testProfile);
      await unitOfWork.commit();

      // Verify it exists
      expect(await userProfileRepo.findById('user789')).not.toBeNull();

      // Remove it
      await userProfileRepo.remove('user789');
      await unitOfWork.commit();

      // Verify it's gone
      expect(await userProfileRepo.findById('user789')).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const result = await userProfileRepo.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('D1AuthProviderLinkRepository', () => {
    it('should link and find auth provider connections', async () => {
      const userId = 'user123';
      const providerId = 'google123';

      // Link the provider
      await authProviderRepo.link('google', providerId, userId);
      await unitOfWork.commit();

      // Find by provider ID
      const foundUserId = await authProviderRepo.findUserIdByProviderId('google', providerId);
      expect(foundUserId).toBe(userId);

      // Find by user ID
      const providerLinks = await authProviderRepo.findLinksByUserId(userId);
      expect(providerLinks).toHaveLength(1);
      expect(providerLinks[0].provider_type).toBe('google');
      expect(providerLinks[0].provider_id).toBe(providerId);
      expect(providerLinks[0].user_id).toBe(userId);

      console.log('\n==== AUTH PROVIDER IN DATABASE ====');
      const rawProvider = await db.prepare(`SELECT * FROM ${AUTH_PROVIDERS_TABLE_NAME}`).first();
      console.log(JSON.stringify(rawProvider, null, 2));
    });

    it('should unlink auth provider connections', async () => {
      const userId = 'user456';
      const providerId = 'google456';

      // Link the provider
      await authProviderRepo.link('google', providerId, userId);
      await unitOfWork.commit();

      // Verify it exists
      expect(await authProviderRepo.findUserIdByProviderId('google', providerId)).toBe(userId);

      // Unlink it
      await authProviderRepo.unlink('google', providerId);
      await unitOfWork.commit();

      // Verify it's gone
      expect(await authProviderRepo.findUserIdByProviderId('google', providerId)).toBeNull();
      expect(await authProviderRepo.findLinksByUserId(userId)).toHaveLength(0);
    });



    it('should return null for non-existent provider', async () => {
      const result = await authProviderRepo.findUserIdByProviderId('google', 'nonexistent');
      expect(result).toBeNull();
    });

    it('should return empty array for user with no providers', async () => {
      const result = await authProviderRepo.findLinksByUserId('nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('D1PATTokenRepository', () => {
    it('should create and list PAT tokens', async () => {
      const userId = 'user123';
      const tokenId = 'pat123';
      const tokenName = 'Test Token';

      // First, link the user with PAT provider (needed for the join query to work)
      await authProviderRepo.link('pat', tokenId, userId);

      // Create the token
      await patTokenRepo.createToken(tokenId, tokenName);
      await unitOfWork.commit();

      // List tokens for user
      const userTokens = await patTokenRepo.listTokens(userId);
      expect(userTokens).toHaveLength(1);
      expect(userTokens[0].token_name).toBe(tokenName);
      expect(userTokens[0].provider_type).toBe('pat');
      expect(userTokens[0].provider_id).toBe(tokenId);
      expect(userTokens[0].user_id).toBe(userId);

      console.log('\n==== PAT TOKEN IN DATABASE ====');
      const rawToken = await db.prepare(`SELECT * FROM ${PAT_TOKENS_TABLE_NAME}`).first();
      console.log(JSON.stringify(rawToken, null, 2));
    });

    it('should delete PAT tokens', async () => {
      const userId = 'user456';
      const tokenId = 'pat456';
      const tokenName = 'Token to Delete';

      // Link the user with PAT provider and create token
      await authProviderRepo.link('pat', tokenId, userId);
      await patTokenRepo.createToken(tokenId, tokenName);
      await unitOfWork.commit();

      // Verify it exists
      const tokensBeforeDelete = await patTokenRepo.listTokens(userId);
      expect(tokensBeforeDelete).toHaveLength(1);

      // Delete the token
      await patTokenRepo.deleteToken(tokenId);
      await unitOfWork.commit();

      // Verify it's gone (the token record is gone, but provider link might remain)
      const rawToken = await db.prepare(`SELECT * FROM ${PAT_TOKENS_TABLE_NAME} WHERE id = ?`).bind(tokenId).first();
      expect(rawToken).toBeNull();
    });

    it('should return empty array for user with no tokens', async () => {
      const result = await patTokenRepo.listTokens('nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('Cross-Repository Integration', () => {
    it('should handle complex user scenario with profile, auth provider, and PAT token', async () => {
      const userId = 'complex-user';

      // Create user profile
      const userProfile: UserProfileDTO = {
        id: userId,
        display_name: 'Complex User',
        email: 'complex@example.com',
        last_login_at: new Date(),
      };
      await userProfileRepo.create(userProfile);

      // Link Google auth
      await authProviderRepo.link('google', 'google-complex', userId);

      // Create PAT token
      await patTokenRepo.createToken('pat-complex', 'Complex Token');

      // Commit all changes
      await unitOfWork.commit();

      // Verify everything was created correctly
      const profile = await userProfileRepo.findById(userId);
      expect(profile).not.toBeNull();
      expect(profile!.display_name).toBe('Complex User');

      const authUserId = await authProviderRepo.findUserIdByProviderId('google', 'google-complex');
      expect(authUserId).toBe(userId);

      const tokens = await patTokenRepo.listTokens(userId);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token_name).toBe('Complex Token');

      console.log('\n==== COMPLETE USER DATA ====');
      console.log('Profile:', profile);
      console.log('Auth providers:', await authProviderRepo.findLinksByUserId(userId));
      console.log('PAT tokens:', tokens);
    });

    it('should maintain atomicity across repositories with unit of work', async () => {
      const userId = 'atomic-user';

      // Create user profile
      const userProfile: UserProfileDTO = {
        id: userId,
        display_name: 'Atomic User',
      };
      await userProfileRepo.create(userProfile);

      // Link auth provider
      await authProviderRepo.link('google', 'google-atomic', userId);

      // Don't commit yet - verify nothing is in the database
      expect(await userProfileRepo.findById(userId)).toBeNull();
      expect(await authProviderRepo.findUserIdByProviderId('google', 'google-atomic')).toBeNull();

      // Now commit everything at once
      await unitOfWork.commit();

      // Verify everything is now in the database
      expect(await userProfileRepo.findById(userId)).not.toBeNull();
      expect(await authProviderRepo.findUserIdByProviderId('google', 'google-atomic')).toBe(userId);
    });
  });
});
