import type {
  AuthProviderLinkDTO,
  AuthProviderType,
  UserProfileDTO
} from './schema';

// Base UnitOfWork interface from eventstore package
export interface UnitOfWork {
  commit(): Promise<void>;
}

// Stager factory type for dependency injection
export type StagerFactory<T> = (uow: UnitOfWork) => T;

export interface UserProfileStager {
  createUserProfile(profile: UserProfileDTO): void;
  updateUserProfile(profile: UserProfileDTO): void;
  removeUserProfile(id: string): void;
}

export interface AuthProviderLinkStager {
  linkAuthProvider(providerType: AuthProviderType, providerId: string, userId: string): void;
  unlinkAuthProvider(providerType: AuthProviderType, providerId: string): void;
  updateLastLogin(providerType: AuthProviderType, providerId: string): void;
  deleteAuthProviderLinksByProviderId(providerType: AuthProviderType, providerId: string): void;
  deleteAuthProviderLinksByUserId(userId: string): void;
}

export interface PATTokenStager {
  registerToken(tokenId: string, name: string): void;
  unregisterToken(tokenId: string): void;
}

export interface UserProfileQuery {
  findById(id: string): Promise<UserProfileDTO | null>;
}

export interface AuthProviderLinkQuery {
  findUserIdByProviderId(providerType: AuthProviderType, providerId: string): Promise<string | null>;
  findLinksByUserId(userId: string): Promise<AuthProviderLinkDTO[]>;
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
