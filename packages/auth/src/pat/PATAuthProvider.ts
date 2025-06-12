import crypto from 'node:crypto';

import type {
  AuthProvider,
  AuthProviderLinkRepository,
  HttpLikeRequest,
  Pepper,
  UserProfileRepository,
} from '@auth/core';
import type { UserProfileDTO } from '@auth/schema';

import type { PATTokenRepository } from './core';
import type { PATTokenPrivateDTO, PATTokenDetailed } from './schema';

export interface PATAuthProvider extends AuthProvider<HttpLikeRequest> {
  generateToken(userId: string, tokenName: string): Promise<PATTokenPrivateDTO>;
  deleteToken(userId: string, tokenId: string): Promise<void>;
  listTokens(userId: string): Promise<PATTokenDetailed[]>;
}

export interface PATAuthProviderConfig {
  readonly authProviderLinkRepository: AuthProviderLinkRepository;
  readonly userProfileRepository: UserProfileRepository;
  readonly patTokenRepository: PATTokenRepository;
  readonly pepper: Pepper;
}

export class PATAuthProviderImpl implements PATAuthProvider {
  private readonly authProviderLinkRepository: AuthProviderLinkRepository;
  private readonly userProfileRepository: UserProfileRepository;
  private readonly patTokenRepository: PATTokenRepository;
  private readonly pepper: Pepper;

  constructor(config: Readonly<PATAuthProviderConfig>) {
    this.authProviderLinkRepository = config.authProviderLinkRepository;
    this.patTokenRepository = config.patTokenRepository;
    this.pepper = config.pepper;
    this.userProfileRepository = config.userProfileRepository;
  }

  canHandle(request: unknown): request is HttpLikeRequest {
    return this.extractToken(request as HttpLikeRequest) !== null;
  }

  async authenticate(request: HttpLikeRequest): Promise<UserProfileDTO> {
    const rawToken = this.extractToken(request);
    if (!rawToken) {
      throw new Error('Invalid PAT token');
    }

    // Generate the peppered token hash
    const pepperedTokenHash = this.pepper.pepper(rawToken);

    // Look up user by the peppered token hash (which is stored as provider_id)
    const userId = await this.authProviderLinkRepository.loginByProviderId('pat', pepperedTokenHash);

    const userProfile = await this.userProfileRepository.findById(userId);
    if (!userProfile) {
      throw new Error('User not found');
    }

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
    const tokenId = crypto.randomUUID();

    // Generate the peppered hash that will be stored as provider_id
    const pepperedTokenHash = this.pepper.pepper(rawToken);

    // Store the token in both repositories
    await Promise.all([
      this.authProviderLinkRepository.link('pat', pepperedTokenHash, userId),
      this.patTokenRepository.createToken(tokenId, tokenName)
    ]);

    return {
      id: tokenId,
      name: tokenName,
      token: rawToken // This is the only time we show the actual token!
    };
  }

  async deleteToken(_userId: string, tokenId: string): Promise<void> {
    const pepperedTokenHash = this.pepper.pepper(tokenId);
    await Promise.all([
      this.authProviderLinkRepository.deleteByProviderId('pat', pepperedTokenHash),
      this.patTokenRepository.deleteToken(tokenId)
    ]);
  }

  async listTokens(userId: string): Promise<PATTokenDetailed[]> {
    return this.patTokenRepository.listTokens(userId);
  }

  private createRawToken(): string {
    // Generate a secure random token with pat_ prefix
    return `pat_${crypto.randomBytes(32).toString('base64url')}`;
  }
}
