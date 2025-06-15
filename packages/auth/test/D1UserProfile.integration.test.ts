import { describe, it, expect, beforeAll } from 'vitest';
import { D1Consts } from '@auth/d1';
import type { UserProfileDTO } from '@auth/schema';
import type { UnitOfWork, UserProfileStager } from '@auth/core';

import { setupTestContext, type TestContext } from './test-setup';

describe('D1UserProfile Integration', () => {
  let ctx: TestContext;
  let unitOfWork: UnitOfWork;
  let userProfileStager: UserProfileStager;

  beforeAll(async () => {
    ctx = await setupTestContext();
  });

  beforeEach(() => {
    const stagers = ctx.createStagers();
    unitOfWork = stagers.unitOfWork;
    userProfileStager = stagers.userProfileStager;
  });

  it('should return null for non-existent user', async () => {
    const result = await ctx.userProfileQuery.findById('nonexistent');
    expect(result).toBeNull();
  });

  it('should create and find a user profile', async () => {
    const now = new Date();
    const testProfile: UserProfileDTO = {
      id: 'user123',
      display_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      email: 'test@example.com',
      last_login_at: now.getTime(),
    };

    // Create the profile using stager pattern
    userProfileStager.createUserProfile(testProfile);
    await unitOfWork.commit();

    // Verify it was created using query
    const foundProfile = await ctx.userProfileQuery.findById('user123');
    expect(foundProfile).not.toBeNull();
    expect(foundProfile!.id).toBe('user123');
    expect(foundProfile!.display_name).toBe('Test User');
    expect(foundProfile!.avatar_url).toBe('https://example.com/avatar.jpg');
    expect(foundProfile!.email).toBe('test@example.com');
    expect(foundProfile!.last_login_at).toEqual(now.getTime());

    console.log('\n==== USER PROFILE IN DATABASE ====');
    const rawProfile = await ctx.db.prepare(`SELECT * FROM ${D1Consts.USER_PROFILES_TABLE_NAME}`).first();
    console.log(JSON.stringify(rawProfile, null, 2));
  });

  it('should update the existing user profile', async () => {
    // Update the existing user123 profile from the previous test
    const updatedProfile: UserProfileDTO = {
      id: 'user123',
      display_name: 'Updated Test User',
      avatar_url: 'https://example.com/new-avatar.jpg',
      email: 'updated@example.com',
      last_login_at: Date.now(),
    };

    // Update using stager pattern
    userProfileStager.updateUserProfile(updatedProfile);
    await unitOfWork.commit();

    // Verify the update using query
    const foundProfile = await ctx.userProfileQuery.findById('user123');
    expect(foundProfile!.display_name).toBe('Updated Test User');
    expect(foundProfile!.avatar_url).toBe('https://example.com/new-avatar.jpg');
    expect(foundProfile!.email).toBe('updated@example.com');
  });

  it('should remove the existing user profile', async () => {
    // Verify the user123 profile exists (from previous tests)
    expect(await ctx.userProfileQuery.findById('user123')).not.toBeNull();

    // Remove it using stager pattern
    userProfileStager.removeUserProfile('user123');
    await unitOfWork.commit();

    // Verify it's gone using query
    expect(await ctx.userProfileQuery.findById('user123')).toBeNull();
  });
});
