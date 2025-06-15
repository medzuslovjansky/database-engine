import { describe, it, expect, beforeAll } from 'vitest';
import type { UserProfileDTO } from '@auth/schema';
import type { PATTokenDetailed } from '@auth/pat';

import { setupTestContext, type TestContext } from './test-setup';

describe('PATAuthProvider', () => {
  let ctx: TestContext;
  let testUser: UserProfileDTO;
  let testToken: string;

  beforeAll(async () => {
    ctx = await setupTestContext();

    // Create a test user with a token for reuse across tests
    testUser = {
      id: 'test-user',
      display_name: 'Test User',
      email: 'test@example.com',
    };

    const tokenResult = await ctx.patAuthProvider.createUserWithPATToken(testUser, 'Test Token');
    testToken = tokenResult.token;
  });

  function createMockRequest(authHeader: string | null = null) {
    return {
      getHeader: (name: string) => name === 'Authorization' ? authHeader : null
    };
  }

  describe('canHandle', () => {
    it('should handle requests with valid PAT token format', () => {
      const request = createMockRequest(`Bearer ${testToken}`);

      const canHandle = ctx.patAuthProvider.canHandle(request);

      expect(canHandle).toBe(true);
    });

    it('should not handle requests with non-PAT tokens', () => {
      const request = createMockRequest('Bearer regular-token-123');

      const canHandle = ctx.patAuthProvider.canHandle(request);

      expect(canHandle).toBe(false);
    });

    it('should not handle requests without Authorization header', () => {
      const request = createMockRequest(null);

      const canHandle = ctx.patAuthProvider.canHandle(request);

      expect(canHandle).toBe(false);
    });
  });

  describe('authenticate', () => {
    it('should authenticate with valid PAT token', async () => {
      const request = createMockRequest(`Bearer ${testToken}`);

      // Authenticate
      const authenticatedUser = await ctx.patAuthProvider.authenticate(request);

      expect(authenticatedUser).not.toBeNull();
      expect(authenticatedUser.id).toBe(testUser.id);
      expect(authenticatedUser.display_name).toBe(testUser.display_name);
      expect(authenticatedUser.email).toBe(testUser.email);
    });

    it('should throw error for invalid PAT token', async () => {
      const request = createMockRequest('Bearer pat_invalid-token-123');

      await expect(ctx.patAuthProvider.authenticate(request)).rejects.toThrow();
    });

    it('should throw error for missing Authorization header', async () => {
      const request = createMockRequest(null);

      await expect(ctx.patAuthProvider.authenticate(request)).rejects.toThrow('Invalid PAT token');
    });
  });

  describe('generateToken', () => {
    it('should generate token for existing user', async () => {
      // Generate additional token for existing test user
      const tokenResult = await ctx.patAuthProvider.generateToken(testUser.id, 'Generated Token');

      expect(tokenResult.name).toBe('Generated Token');
      expect(tokenResult.token).toMatch(/^pat_/);
      expect(tokenResult.id).toBeDefined(); // This is the peppered hash, not the raw token
    });

    it('should create auth provider link when generating token', async () => {
      const tokenResult = await ctx.patAuthProvider.generateToken(testUser.id, 'Linked Token');

      // Verify auth provider link was created by checking if we can find the user
      const userId = await ctx.authProviderLinkQuery.findUserIdByProviderId('pat', tokenResult.id);
      expect(userId).toBe(testUser.id);
    });

        it('should store token metadata', async () => {
      const { token } = await ctx.patAuthProvider.generateToken(testUser.id, 'Stored Token');
      expect(token).toMatch(/^pat_/);

      // Verify token metadata was stored using PATAuthProvider's own method
      const tokens = await ctx.patAuthProvider.listTokens(testUser.id);
      expect(tokens.length).toBeGreaterThan(0);

      const storedToken = tokens.find(t => t.token_name === 'Stored Token');
      expect(storedToken).toMatchObject({
        token_name: 'Stored Token',
        provider_type: 'pat',
        user_id: testUser.id
      });
    });
  });

  describe('unregisterToken', () => {
    it('should unregister token and remove auth provider link', async () => {
      const userProfile: UserProfileDTO = {
        id: 'delete-user',
        display_name: 'Delete User',
        email: 'delete@example.com',
      };

      // Create user and token
      const tokenResult = await ctx.patAuthProvider.createUserWithPATToken(userProfile, 'Delete Token');

      // Verify token metadata exists
      const tokensBefore = await ctx.patAuthProvider.listTokens(userProfile.id);
      expect(tokensBefore).toHaveLength(1);
      expect(await ctx.authProviderLinkQuery.findUserIdByProviderId('pat', tokenResult.id)).toBe(userProfile.id);

      // Unregister token (pass the raw token, provider will pepper it internally)
      await ctx.patAuthProvider.unregisterToken(userProfile.id, tokenResult.token);

      // Verify token metadata and link are gone
      const tokensAfter = await ctx.patAuthProvider.listTokens(userProfile.id);
      expect(tokensAfter).toHaveLength(0);
      expect(await ctx.authProviderLinkQuery.findUserIdByProviderId('pat', tokenResult.id)).toBeNull();
    });

    it('should handle unregistering non-existent token gracefully', async () => {
      const userProfile: UserProfileDTO = {
        id: 'nonexistent-user',
        display_name: 'Nonexistent User',
        email: 'nonexistent@example.com',
      };

      // Should not throw when unregistering non-existent token
      await expect(
        ctx.patAuthProvider.unregisterToken(userProfile.id, 'pat_nonexistent')
      ).resolves.not.toThrow();
    });
  });

  describe('listTokens', () => {
    it('should list all tokens for user', async () => {
      // Add another token to the existing test user
      await ctx.patAuthProvider.generateToken(testUser.id, 'List Test Token');

      const tokens = await ctx.patAuthProvider.listTokens(testUser.id);

      expect(tokens.length).toBeGreaterThan(0);
      const tokenNames = tokens.map((t: PATTokenDetailed) => t.token_name);
      expect(tokenNames).toContain('Test Token'); // From beforeAll
      expect(tokenNames).toContain('List Test Token'); // Just created
    });

    it('should return empty array for user with no tokens', async () => {
      const tokens = await ctx.patAuthProvider.listTokens('user-with-no-tokens');

      expect(tokens).toHaveLength(0);
    });
  });

  describe('createUserWithPATToken', () => {
    it('should create user and token atomically', async () => {
      const userProfile: UserProfileDTO = {
        id: 'atomic-user',
        display_name: 'Atomic User',
        email: 'atomic@example.com',
      };

      const tokenResult = await ctx.patAuthProvider.createUserWithPATToken(userProfile, 'Atomic Token');

      // Verify user was created by checking if we can find them
      const createdUser = await ctx.userProfileQuery.findById(userProfile.id);
      expect(createdUser).not.toBeNull();
      expect(createdUser!.display_name).toBe('Atomic User');

      // Verify token metadata was created using PATAuthProvider's own method
      const tokens = await ctx.patAuthProvider.listTokens(userProfile.id);
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({
        token_name: 'Atomic Token',
        provider_type: 'pat',
        user_id: userProfile.id
      });

      // Verify auth provider link was created with peppered hash
      const userId = await ctx.authProviderLinkQuery.findUserIdByProviderId('pat', tokenResult.id);
      expect(userId).toBe(userProfile.id);
    });

    it('should throw error if user already exists', async () => {
      const userProfile: UserProfileDTO = {
        id: 'duplicate-user',
        display_name: 'Duplicate User',
        email: 'duplicate@example.com',
      };

      // Create user first using PATAuthProvider
      await ctx.patAuthProvider.createUserWithPATToken(userProfile, 'First Token');

      // Try to create same user again
      await expect(
        ctx.patAuthProvider.createUserWithPATToken(userProfile, 'Duplicate Token')
      ).rejects.toThrow();
    });

    it('should return token with proper format', async () => {
      const userProfile: UserProfileDTO = {
        id: 'format-user',
        display_name: 'Format User',
        email: 'format@example.com',
      };

      const tokenResult = await ctx.patAuthProvider.createUserWithPATToken(userProfile, 'Format Token');

      expect(tokenResult.name).toBe('Format Token');
      expect(tokenResult.token).toMatch(/^pat_/); // Raw token returned only once
      expect(tokenResult.id).toBeDefined(); // This is the peppered hash used as provider_id
      expect(typeof tokenResult.token).toBe('string');
    });
  });
});
