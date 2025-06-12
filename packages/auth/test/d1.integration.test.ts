import { describe, it, expect, beforeEach } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { createAuthCompositionRoot } from '@auth/composition-root'
import { D1Consts } from '@auth/d1';
import type {
  D1AuthMigrations,
  D1AuthProviderLinkRepository,
  D1PATTokenRepository,
  D1UnitOfWork,
  D1UserProfileRepository
} from '@auth/d1';
import type { UserProfileDTO } from '@auth/schema';

describe('D1 Auth Repositories Integration Suite', () => {
  let db: D1Database;
  let migrations: D1AuthMigrations;
  let userProfileRepository: D1UserProfileRepository;
  let authProviderLinkRepository: D1AuthProviderLinkRepository;
  let tokenRepository: D1PATTokenRepository;
  let unitOfWork: D1UnitOfWork;

  beforeEach(async () => {
    db = globalThis.__MINIFLARE_DB__;

    ({
      authProviderLinkRepository,
      migrations,
      tokenRepository,
      unitOfWork,
      userProfileRepository,
    } = createAuthCompositionRoot({
      db,
      tokenPepper: 'test-pepper'
    }));

    await migrations.reset();
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
      await userProfileRepository.create(testProfile);
      await unitOfWork.commit();

      // Verify it was created
      const foundProfile = await userProfileRepository.findById('user123');
      expect(foundProfile).not.toBeNull();
      expect(foundProfile!.id).toBe('user123');
      expect(foundProfile!.display_name).toBe('Test User');
      expect(foundProfile!.avatar_url).toBe('https://example.com/avatar.jpg');
      expect(foundProfile!.email).toBe('test@example.com');
      expect(foundProfile!.last_login_at).toEqual(now);

      console.log('\n==== USER PROFILE IN DATABASE ====');
      const rawProfile = await db.prepare(`SELECT * FROM ${D1Consts.USER_PROFILES_TABLE_NAME}`).first();
      console.log(JSON.stringify(rawProfile, null, 2));
    });

    it('should update an existing user profile', async () => {
      const originalProfile: UserProfileDTO = {
        id: 'user456',
        display_name: 'Original Name',
        email: 'original@example.com',
      };

      // Create the profile
      await userProfileRepository.create(originalProfile);
      await unitOfWork.commit();

      // Update the profile
      const updatedProfile: UserProfileDTO = {
        id: 'user456',
        display_name: 'Updated Name',
        avatar_url: 'https://example.com/new-avatar.jpg',
        email: 'updated@example.com',
        last_login_at: new Date(),
      };

      await userProfileRepository.update(updatedProfile);
      await unitOfWork.commit();

      // Verify the update
      const foundProfile = await userProfileRepository.findById('user456');
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
      await userProfileRepository.create(testProfile);
      await unitOfWork.commit();

      // Verify it exists
      expect(await userProfileRepository.findById('user789')).not.toBeNull();

      // Remove it
      await userProfileRepository.remove('user789');
      await unitOfWork.commit();

      // Verify it's gone
      expect(await userProfileRepository.findById('user789')).toBeNull();
    });

    it('should return null for non-existent user', async () => {
      const result = await userProfileRepository.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('D1AuthProviderLinkRepository', () => {
    it('should link and find auth provider connections', async () => {
      const userId = 'user123';
      const providerId = 'google123';

      // Link the provider
      await authProviderLinkRepository.link('google', providerId, userId);
      await unitOfWork.commit();

      // Find by provider ID
      const foundUserId = await authProviderLinkRepository.findUserIdByProviderId('google', providerId);
      expect(foundUserId).toBe(userId);

      // Find by user ID
      const providerLinks = await authProviderLinkRepository.findLinksByUserId(userId);
      expect(providerLinks).toHaveLength(1);
      expect(providerLinks[0].provider_type).toBe('google');
      expect(providerLinks[0].provider_id).toBe(providerId);
      expect(providerLinks[0].user_id).toBe(userId);

      console.log('\n==== AUTH PROVIDER IN DATABASE ====');
      const rawProvider = await db.prepare(`SELECT * FROM ${D1Consts.AUTH_PROVIDERS_TABLE_NAME}`).first();
      console.log(JSON.stringify(rawProvider, null, 2));
    });

    it('should unlink auth provider connections', async () => {
      const userId = 'user456';
      const providerId = 'google456';

      // Link the provider
      await authProviderLinkRepository.link('google', providerId, userId);
      await unitOfWork.commit();

      // Verify it exists
      expect(await authProviderLinkRepository.findUserIdByProviderId('google', providerId)).toBe(userId);

      // Unlink it
      await authProviderLinkRepository.unlink('google', providerId);
      await unitOfWork.commit();

      // Verify it's gone
      expect(await authProviderLinkRepository.findUserIdByProviderId('google', providerId)).toBeNull();
      expect(await authProviderLinkRepository.findLinksByUserId(userId)).toHaveLength(0);
    });



    it('should return null for non-existent provider', async () => {
      const result = await authProviderLinkRepository.findUserIdByProviderId('google', 'nonexistent');
      expect(result).toBeNull();
    });

    it('should return empty array for user with no providers', async () => {
      const result = await authProviderLinkRepository.findLinksByUserId('nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('D1PATTokenRepository', () => {
    it('should create and list PAT tokens', async () => {
      const userId = 'user123';
      const tokenId = 'pat123';
      const tokenName = 'Test Token';

      // First, link the user with PAT provider (needed for the join query to work)
      await authProviderLinkRepository.link('pat', tokenId, userId);

      // Create the token
      await tokenRepository.createToken(tokenId, tokenName);
      await unitOfWork.commit();

      // List tokens for user
      const userTokens = await tokenRepository.listTokens(userId);
      expect(userTokens).toHaveLength(1);
      expect(userTokens[0].token_name).toBe(tokenName);
      expect(userTokens[0].provider_type).toBe('pat');
      expect(userTokens[0].provider_id).toBe(tokenId);
      expect(userTokens[0].user_id).toBe(userId);

      console.log('\n==== PAT TOKEN IN DATABASE ====');
      const rawToken = await db.prepare(`SELECT * FROM ${D1Consts.PAT_TOKENS_TABLE_NAME}`).first();
      console.log(JSON.stringify(rawToken, null, 2));
    });

    it('should delete PAT tokens', async () => {
      const userId = 'user456';
      const tokenId = 'pat456';
      const tokenName = 'Token to Delete';

      // Link the user with PAT provider and create token
      await authProviderLinkRepository.link('pat', tokenId, userId);
      await tokenRepository.createToken(tokenId, tokenName);
      await unitOfWork.commit();

      // Verify it exists
      const tokensBeforeDelete = await tokenRepository.listTokens(userId);
      expect(tokensBeforeDelete).toHaveLength(1);

      // Delete the token
      await tokenRepository.deleteToken(tokenId);
      await unitOfWork.commit();

      // Verify it's gone (the token record is gone, but provider link might remain)
      const rawToken = await db.prepare(`SELECT * FROM ${D1Consts.PAT_TOKENS_TABLE_NAME} WHERE id = ?`).bind(tokenId).first();
      expect(rawToken).toBeNull();
    });

    it('should return empty array for user with no tokens', async () => {
      const result = await tokenRepository.listTokens('nonexistent');
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
      await userProfileRepository.create(userProfile);

      // Link Google auth
      await authProviderLinkRepository.link('google', 'google-complex', userId);

      // Create PAT token
      await tokenRepository.createToken('pat-complex', 'Complex Token');

      // Commit all changes
      await unitOfWork.commit();

      // Verify everything was created correctly
      const profile = await userProfileRepository.findById(userId);
      expect(profile).not.toBeNull();
      expect(profile!.display_name).toBe('Complex User');

      const authUserId = await authProviderLinkRepository.findUserIdByProviderId('google', 'google-complex');
      expect(authUserId).toBe(userId);

      const tokens = await tokenRepository.listTokens(userId);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token_name).toBe('Complex Token');

      console.log('\n==== COMPLETE USER DATA ====');
      console.log('Profile:', profile);
      console.log('Auth providers:', await authProviderLinkRepository.findLinksByUserId(userId));
      console.log('PAT tokens:', tokens);
    });

    it('should maintain atomicity across repositories with unit of work', async () => {
      const userId = 'atomic-user';

      // Create user profile
      const userProfile: UserProfileDTO = {
        id: userId,
        display_name: 'Atomic User',
      };
      await userProfileRepository.create(userProfile);

      // Link auth provider
      await authProviderLinkRepository.link('google', 'google-atomic', userId);

      // Don't commit yet - verify nothing is in the database
      expect(await userProfileRepository.findById(userId)).toBeNull();
      expect(await authProviderLinkRepository.findUserIdByProviderId('google', 'google-atomic')).toBeNull();

      // Now commit everything at once
      await unitOfWork.commit();

      // Verify everything is now in the database
      expect(await userProfileRepository.findById(userId)).not.toBeNull();
      expect(await authProviderLinkRepository.findUserIdByProviderId('google', 'google-atomic')).toBe(userId);
    });
  });
});
