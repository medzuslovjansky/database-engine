import crypto from 'node:crypto';

import type {
  AuthProvider,
  AuthProviderLinkQuery,
  AuthProviderLinkStager,
  HttpLikeRequest,
  PATTokenStager,
  Pepper,
  StagerFactory,
  UnitOfWork,
  UserProfileQuery,
  UserProfileStager,
} from '@auth/core';
import type { UserProfileDTO } from '@auth/schema';

import type { PATTokenQuery } from './core';
import type { PATTokenPrivateDTO, PATTokenDetailed } from './schema';

export interface PATAuthProvider extends AuthProvider<HttpLikeRequest> {
  generateToken(userId: string, tokenName: string): Promise<PATTokenPrivateDTO>;
  unregisterToken(userId: string, tokenId: string): Promise<void>;
  listTokens(userId: string): Promise<PATTokenDetailed[]>;
}

export interface PATAuthProviderConfig {
  readonly authProviderLinkQuery: AuthProviderLinkQuery;
  readonly userProfileQuery: UserProfileQuery;
  readonly patTokenQuery: PATTokenQuery;
  readonly userProfileStagerFactory: StagerFactory<UserProfileStager>;
  readonly authProviderLinkStagerFactory: StagerFactory<AuthProviderLinkStager>;
  readonly patTokenStagerFactory: StagerFactory<PATTokenStager>;
  readonly createUnitOfWork: () => UnitOfWork;
  readonly pepper: Pepper;
}

export class PATAuthProviderImpl implements PATAuthProvider {
  constructor(private readonly config: PATAuthProviderConfig) {}

  canHandle(request: unknown): request is HttpLikeRequest {
    return this.extractToken(request as HttpLikeRequest) !== null;
  }

  async authenticate(request: HttpLikeRequest): Promise<UserProfileDTO> {
    const rawToken = this.extractToken(request);
    if (!rawToken) {
      throw new Error('Invalid PAT token');
    }

    // Generate the peppered token hash
    const pepperedTokenHash = this.config.pepper.pepper(rawToken);

    // Look up user by the peppered token hash (which is stored as provider_id)
    const userId = await this.config.authProviderLinkQuery.findUserIdByProviderId('pat', pepperedTokenHash);
    if (!userId) {
      throw new Error('User not found');
    }

    const userProfile = await this.config.userProfileQuery.findById(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

    const unitOfWork = this.config.createUnitOfWork();
    const authProviderLinkStager = this.config.authProviderLinkStagerFactory(unitOfWork);
    authProviderLinkStager.updateLastLogin('pat', pepperedTokenHash);
    await unitOfWork.commit();

    return userProfile;
  }

  private extractToken(request: HttpLikeRequest): string | null {
    const authHeader = request.getHeader('Authorization');
    if (!authHeader) {
      return null;
    }

    const rawToken = authHeader.replace('Bearer ', '');
    if (!rawToken.startsWith('pat_')) {
      return null;
    }

    return rawToken;
  }

  async generateToken(userId: string, tokenName: string): Promise<PATTokenPrivateDTO> {
    // Generate a random token
    const rawToken = this.createRawToken();
    const pepperedTokenHash = this.config.pepper.pepper(rawToken);

    const unitOfWork = this.config.createUnitOfWork();
    const authProviderLinkStager = this.config.authProviderLinkStagerFactory(unitOfWork);
    const patTokenStager = this.config.patTokenStagerFactory(unitOfWork);

    authProviderLinkStager.linkAuthProvider('pat', pepperedTokenHash, userId);
    patTokenStager.registerToken(pepperedTokenHash, tokenName);
    await unitOfWork.commit();

    return {
      id: pepperedTokenHash,
      name: tokenName,
      token: rawToken // This is the only time we show the actual token!
    };
  }

  async unregisterToken(_userId: string, tokenId: string): Promise<void> {
    const pepperedTokenHash = this.config.pepper.pepper(tokenId);

    const unitOfWork = this.config.createUnitOfWork();
    const authProviderLinkStager = this.config.authProviderLinkStagerFactory(unitOfWork);
    const patTokenStager = this.config.patTokenStagerFactory(unitOfWork);

    // Delete PAT token first, then auth provider link (though CASCADE should handle it automatically)
    patTokenStager.unregisterToken(pepperedTokenHash);
    authProviderLinkStager.deleteAuthProviderLinksByProviderId('pat', pepperedTokenHash);
    await unitOfWork.commit();
  }

  async listTokens(userId: string): Promise<PATTokenDetailed[]> {
    return this.config.patTokenQuery.listTokens(userId);
  }

  private createRawToken(): string {
    // Generate a secure random token with pat_ prefix
    return `pat_${crypto.randomBytes(32).toString('base64url')}`;
  }

  /**
   * Admin utility: Atomically creates a user profile and a PAT token for service accounts or automation.
   * Intended for admin/automation use only—never exposed to regular users.
   * Throws if the user already exists.
   *
   * @param userProfile - The user profile to create.
   * @param tokenName - The name for the PAT token.
   * @returns The created PAT token DTO (including the raw token).
   */
  async createUserWithPATToken(
    userProfile: UserProfileDTO,
    tokenName: string
  ): Promise<PATTokenPrivateDTO> {
    const unitOfWork = this.config.createUnitOfWork();
    const userProfileStager = this.config.userProfileStagerFactory(unitOfWork);

    // Stage the user profile creation
    userProfileStager.createUserProfile(userProfile);

    // Generate token and stage its operations (they will use the same unitOfWork)
    const rawToken = this.createRawToken();
    const pepperedTokenHash = this.config.pepper.pepper(rawToken);

    const authProviderLinkStager = this.config.authProviderLinkStagerFactory(unitOfWork);
    const patTokenStager = this.config.patTokenStagerFactory(unitOfWork);

    authProviderLinkStager.linkAuthProvider('pat', pepperedTokenHash, userProfile.id);
    patTokenStager.registerToken(pepperedTokenHash, tokenName);

    // Commit all operations atomically
    await unitOfWork.commit();

    return {
      id: pepperedTokenHash,
      name: tokenName,
      token: rawToken
    };
  }
}
