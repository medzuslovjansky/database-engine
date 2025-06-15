import { describe, it, expect, beforeEach } from 'vitest';
import type { UserProfileDTO } from '@auth/schema';

import { setupTestContext, type TestContext } from './test-setup';

describe('AuthService Integration', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTestContext();
  });

  function createMockRequest(authHeader: string | null = null) {
    return {
      getHeader: (name: string) => name === 'Authorization' ? authHeader : null
    };
  }

  it('should authenticate with valid token', async () => {
    const userProfile: UserProfileDTO = {
      id: 'test-user',
      display_name: 'Test User',
      email: 'test@example.com',
    };

    // Create user with token
    const token = await ctx.patAuthProvider.createUserWithPATToken(userProfile, 'Test Token');

    // Mock request with valid token
    const mockRequest = createMockRequest(`Bearer ${token.token}`);

    // Authenticate through AuthService
    const authenticatedUser = await ctx.authService.authenticate(mockRequest);

    // Should return the user profile
    expect(authenticatedUser).not.toBeNull();
    expect(authenticatedUser!.id).toBe(userProfile.id);
    expect(authenticatedUser!.display_name).toBe(userProfile.display_name);
    expect(authenticatedUser!.email).toBe(userProfile.email);
  });

  it('should reject invalid token', async () => {
    // Mock request with invalid token
    const mockRequest = createMockRequest('Bearer pat_invalid-token-12345');

    // Should throw error for invalid PAT token
    await expect(ctx.patAuthProvider.authenticate(mockRequest)).rejects.toThrow();
  });

  it('should not authenticate an unknown request', async () => {
    // Mock request without Authorization header
    const mockRequest = createMockRequest(null);

    // Should throw error for missing Authorization header
    await expect(ctx.patAuthProvider.authenticate(mockRequest)).rejects.toThrow('Invalid PAT token');
  });
});
