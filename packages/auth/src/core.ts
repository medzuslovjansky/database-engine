import type { UserProfileDTO, AuthProviderType, AuthProviderLinkDTO } from './schema';

export interface UserProfileRepository {
  findById(id: string): Promise<UserProfileDTO | null>;
  create(profile: UserProfileDTO): Promise<void>;
  update(profile: UserProfileDTO): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface AuthProviderLinkRepository {
  findUserIdByProviderId(providerType: AuthProviderType, providerId: string): Promise<string | null>;
  findLinksByUserId(userId: string): Promise<AuthProviderLinkDTO[]>;
  link(providerType: AuthProviderType, providerId: string, userId: string): Promise<void>;
  unlink(providerType: AuthProviderType, providerId: string): Promise<void>;
  deleteByProviderId(providerType: AuthProviderType, providerId: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

// Auth provider interfaces
export interface HttpLikeRequest {
  getHeader(name: string): string | null;
}

export interface AuthProvider<Request = unknown> {
  /** @throws */
  authenticate(request: Request): Promise<UserProfileDTO>;
  canHandle(request: unknown): request is Request;
}

// Pepper utility interface
export interface Pepper {
  pepper(...strings: string[]): string;
}

// DateTime utility interface
export interface DateTimeProvider {
  now(): Date;
  nowUnix(): number;
  fromUnix(timestamp: number): Date;
  toUnix(date: Date): number;
}
