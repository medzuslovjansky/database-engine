# @interslavic/database-engine-auth Package Skeleton

## Directory Structure

```
packages/database-engine-auth/
├── src/
│   ├── core/
│   │   ├── entities/
│   │   │   ├── AuthProvider.ts
│   │   │   ├── UserProfile.ts
│   │   │   └── TokenData.ts
│   │   ├── repositories/
│   │   │   ├── IAuthProviderRepository.ts
│   │   │   ├── IUserProfileRepository.ts
│   │   │   └── ITokenRepository.ts
│   │   ├── services/
│   │   │   ├── AuthenticationService.ts
│   │   │   ├── UserProfileService.ts
│   │   │   ├── TokenService.ts
│   │   │   └── ProviderLinkingService.ts
│   │   ├── value-objects/
│   │   │   ├── ProviderId.ts
│   │   │   ├── UserId.ts
│   │   │   ├── ProviderType.ts
│   │   │   └── HashedToken.ts
│   │   └── errors/
│   │       ├── AuthenticationError.ts
│   │       ├── InvalidTokenError.ts
│   │       ├── ProviderNotLinkedError.ts
│   │       └── UserNotFoundError.ts
│   ├── google/
│   │   ├── GoogleAuthProvider.ts
│   │   ├── GoogleTokenValidator.ts
│   │   ├── GoogleJwtPayload.ts
│   │   └── GoogleAuthConfig.ts
│   ├── d1/
│   │   ├── repositories/
│   │   │   ├── D1AuthProviderRepository.ts
│   │   │   ├── D1UserProfileRepository.ts
│   │   │   └── D1TokenRepository.ts
│   │   ├── migrations/
│   │   │   └── CreateAuthTables.ts
│   │   └── D1AuthCompositionRoot.ts
│   ├── utils/
│   │   ├── TokenHasher.ts
│   │   ├── JwtDecoder.ts
│   │   └── DateTimeProvider.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## File Contents

### Core Domain

#### src/core/entities/AuthProvider.ts
```typescript
import type { ProviderId } from '../value-objects/ProviderId';
import type { UserId } from '../value-objects/UserId';
import type { ProviderType } from '../value-objects/ProviderType';

export interface AuthProvider {
  id: string;
  providerId: ProviderId;
  providerType: ProviderType;
  userId: UserId;
  createdAt: Date;
  lastLoginAt?: Date;
}
```

#### src/core/entities/UserProfile.ts
```typescript
import type { UserId } from '../value-objects/UserId';

export interface UserProfile {
  userId: UserId;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  lastLoginAt?: Date;
}
```

#### src/core/entities/TokenData.ts
```typescript
import type { HashedToken } from '../value-objects/HashedToken';
import type { UserId } from '../value-objects/UserId';

export interface TokenData {
  id: string;
  hashedToken: HashedToken;
  userId: UserId;
  type: 'access' | 'refresh';
  expiresAt: Date;
  createdAt: Date;
}
```

#### src/core/repositories/IAuthProviderRepository.ts
```typescript
import type { AuthProvider } from '../entities/AuthProvider';
import type { ProviderId } from '../value-objects/ProviderId';
import type { ProviderType } from '../value-objects/ProviderType';
import type { UserId } from '../value-objects/UserId';

export interface IAuthProviderRepository {
  findByProvider(providerId: ProviderId, providerType: ProviderType): Promise<AuthProvider | null>;
  findByUserId(userId: UserId): Promise<AuthProvider[]>;
  create(provider: AuthProvider): Promise<void>;
  updateLastLogin(providerId: ProviderId, providerType: ProviderType, lastLoginAt: Date): Promise<void>;
  delete(providerId: ProviderId, providerType: ProviderType): Promise<void>;
}
```

#### src/core/repositories/IUserProfileRepository.ts
```typescript
import type { UserProfile } from '../entities/UserProfile';
import type { UserId } from '../value-objects/UserId';

export interface IUserProfileRepository {
  findByUserId(userId: UserId): Promise<UserProfile | null>;
  create(profile: UserProfile): Promise<void>;
  update(profile: UserProfile): Promise<void>;
  delete(userId: UserId): Promise<void>;
}
```

#### src/core/repositories/ITokenRepository.ts
```typescript
import type { TokenData } from '../entities/TokenData';
import type { HashedToken } from '../value-objects/HashedToken';

export interface ITokenRepository {
  findByHashedToken(hashedToken: HashedToken): Promise<TokenData | null>;
  create(token: TokenData): Promise<void>;
  deleteExpired(): Promise<void>;
  deleteByHashedToken(hashedToken: HashedToken): Promise<void>;
}
```

#### src/core/services/AuthenticationService.ts
```typescript
import type { IAuthProviderRepository } from '../repositories/IAuthProviderRepository';
import type { IUserProfileRepository } from '../repositories/IUserProfileRepository';
import type { ProviderLinkingService } from './ProviderLinkingService';
import type { UserProfileService } from './UserProfileService';
import type { ProviderId } from '../value-objects/ProviderId';
import type { ProviderType } from '../value-objects/ProviderType';
import type { UserId } from '../value-objects/UserId';

export interface AuthenticationResult {
  userId: UserId;
  isNewUser: boolean;
}

export class AuthenticationService {
  constructor(
    private readonly authProviderRepository: IAuthProviderRepository,
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly providerLinkingService: ProviderLinkingService,
    private readonly userProfileService: UserProfileService
  ) {}

  async authenticateWithProvider(
    providerId: ProviderId,
    providerType: ProviderType,
    profileData?: {
      displayName?: string;
      email?: string;
      avatarUrl?: string;
    }
  ): Promise<AuthenticationResult> {
    throw new Error('Not implemented');
  }

  async findUserByProvider(
    providerId: ProviderId,
    providerType: ProviderType
  ): Promise<UserId | null> {
    throw new Error('Not implemented');
  }
}
```

#### src/core/services/UserProfileService.ts
```typescript
import type { IUserProfileRepository } from '../repositories/IUserProfileRepository';
import type { UserProfile } from '../entities/UserProfile';
import type { UserId } from '../value-objects/UserId';

export class UserProfileService {
  constructor(
    private readonly userProfileRepository: IUserProfileRepository
  ) {}

  async getProfile(userId: UserId): Promise<UserProfile | null> {
    throw new Error('Not implemented');
  }

  async updateProfile(userId: UserId, updates: Partial<UserProfile>): Promise<void> {
    throw new Error('Not implemented');
  }

  async deleteProfile(userId: UserId): Promise<void> {
    throw new Error('Not implemented');
  }

  async touchLastLogin(userId: UserId): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

#### src/core/services/TokenService.ts
```typescript
import type { ITokenRepository } from '../repositories/ITokenRepository';
import type { TokenHasher } from '../../utils/TokenHasher';
import type { UserId } from '../value-objects/UserId';

export class TokenService {
  constructor(
    private readonly tokenRepository: ITokenRepository,
    private readonly tokenHasher: TokenHasher,
    private readonly pepper: string
  ) {}

  async createAccessToken(userId: UserId): Promise<string> {
    throw new Error('Not implemented');
  }

  async createRefreshToken(userId: UserId): Promise<string> {
    throw new Error('Not implemented');
  }

  async validateToken(token: string): Promise<UserId | null> {
    throw new Error('Not implemented');
  }

  async revokeToken(token: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async cleanupExpiredTokens(): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

#### src/core/services/ProviderLinkingService.ts
```typescript
import type { IAuthProviderRepository } from '../repositories/IAuthProviderRepository';
import type { ProviderId } from '../value-objects/ProviderId';
import type { ProviderType } from '../value-objects/ProviderType';
import type { UserId } from '../value-objects/UserId';

export class ProviderLinkingService {
  constructor(
    private readonly authProviderRepository: IAuthProviderRepository
  ) {}

  async linkProvider(
    userId: UserId,
    providerId: ProviderId,
    providerType: ProviderType
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  async unlinkProvider(
    userId: UserId,
    providerId: ProviderId,
    providerType: ProviderType
  ): Promise<void> {
    throw new Error('Not implemented');
  }

  async unlinkAllProviders(userId: UserId): Promise<void> {
    throw new Error('Not implemented');
  }

  async getLinkedProviders(userId: UserId): Promise<Array<{
    providerId: ProviderId;
    providerType: ProviderType;
  }>> {
    throw new Error('Not implemented');
  }
}
```

#### src/core/value-objects/ProviderId.ts
```typescript
export class ProviderId {
  constructor(private readonly value: string) {
    if (!value) {
      throw new Error('ProviderId cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: ProviderId): boolean {
    return this.value === other.value;
  }
}
```

#### src/core/value-objects/UserId.ts
```typescript
export class UserId {
  constructor(private readonly value: string) {
    if (!value) {
      throw new Error('UserId cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
```

#### src/core/value-objects/ProviderType.ts
```typescript
export enum ProviderType {
  GOOGLE = 'google',
  // Future providers can be added here
}
```

#### src/core/value-objects/HashedToken.ts
```typescript
export class HashedToken {
  constructor(private readonly value: string) {
    if (!value) {
      throw new Error('HashedToken cannot be empty');
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: HashedToken): boolean {
    return this.value === other.value;
  }
}
```

#### src/core/errors/AuthenticationError.ts
```typescript
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
```

#### src/core/errors/InvalidTokenError.ts
```typescript
export class InvalidTokenError extends Error {
  constructor(message: string = 'Invalid token') {
    super(message);
    this.name = 'InvalidTokenError';
  }
}
```

#### src/core/errors/ProviderNotLinkedError.ts
```typescript
export class ProviderNotLinkedError extends Error {
  constructor(message: string = 'Provider not linked to any user') {
    super(message);
    this.name = 'ProviderNotLinkedError';
  }
}
```

#### src/core/errors/UserNotFoundError.ts
```typescript
export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}
```

### Google Implementation

#### src/google/GoogleAuthProvider.ts
```typescript
import type { GoogleTokenValidator } from './GoogleTokenValidator';
import type { GoogleAuthConfig } from './GoogleAuthConfig';
import type { GoogleJwtPayload } from './GoogleJwtPayload';

export class GoogleAuthProvider {
  constructor(
    private readonly config: GoogleAuthConfig,
    private readonly tokenValidator: GoogleTokenValidator
  ) {}

  async validateToken(token: string): Promise<GoogleJwtPayload | null> {
    throw new Error('Not implemented');
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    idToken: string;
    expiresIn: number;
    refreshToken?: string;
  }> {
    throw new Error('Not implemented');
  }

  async exchangeAuthCode(
    code: string,
    codeVerifier: string,
    redirectUri: string
  ): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken?: string;
    expiresIn: number;
  }> {
    throw new Error('Not implemented');
  }
}
```

#### src/google/GoogleTokenValidator.ts
```typescript
import type { GoogleJwtPayload } from './GoogleJwtPayload';

export class GoogleTokenValidator {
  constructor(private readonly clientId: string) {}

  async validate(token: string): Promise<GoogleJwtPayload | null> {
    throw new Error('Not implemented');
  }
}
```

#### src/google/GoogleJwtPayload.ts
```typescript
export interface GoogleJwtPayload {
  iss: string;
  sub: string;
  azp: string;
  aud: string;
  iat: number;
  exp: number;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}
```

#### src/google/GoogleAuthConfig.ts
```typescript
export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  tokenEndpoint?: string;
  jwksUri?: string;
}
```

### D1 Implementation

#### src/d1/repositories/D1AuthProviderRepository.ts
```typescript
import type { D1Database } from '@cloudflare/workers-types';
import type { IAuthProviderRepository } from '../../core/repositories/IAuthProviderRepository';
import type { AuthProvider } from '../../core/entities/AuthProvider';
import type { ProviderId } from '../../core/value-objects/ProviderId';
import type { ProviderType } from '../../core/value-objects/ProviderType';
import type { UserId } from '../../core/value-objects/UserId';

export class D1AuthProviderRepository implements IAuthProviderRepository {
  constructor(
    private readonly db: D1Database,
    private readonly tableName: string = 'auth_providers'
  ) {}

  async findByProvider(providerId: ProviderId, providerType: ProviderType): Promise<AuthProvider | null> {
    throw new Error('Not implemented');
  }

  async findByUserId(userId: UserId): Promise<AuthProvider[]> {
    throw new Error('Not implemented');
  }

  async create(provider: AuthProvider): Promise<void> {
    throw new Error('Not implemented');
  }

  async updateLastLogin(providerId: ProviderId, providerType: ProviderType, lastLoginAt: Date): Promise<void> {
    throw new Error('Not implemented');
  }

  async delete(providerId: ProviderId, providerType: ProviderType): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

#### src/d1/repositories/D1UserProfileRepository.ts
```typescript
import type { D1Database } from '@cloudflare/workers-types';
import type { IUserProfileRepository } from '../../core/repositories/IUserProfileRepository';
import type { UserProfile } from '../../core/entities/UserProfile';
import type { UserId } from '../../core/value-objects/UserId';

export class D1UserProfileRepository implements IUserProfileRepository {
  constructor(
    private readonly db: D1Database,
    private readonly tableName: string = 'user_profiles'
  ) {}

  async findByUserId(userId: UserId): Promise<UserProfile | null> {
    throw new Error('Not implemented');
  }

  async create(profile: UserProfile): Promise<void> {
    throw new Error('Not implemented');
  }

  async update(profile: UserProfile): Promise<void> {
    throw new Error('Not implemented');
  }

  async delete(userId: UserId): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

#### src/d1/repositories/D1TokenRepository.ts
```typescript
import type { D1Database } from '@cloudflare/workers-types';
import type { ITokenRepository } from '../../core/repositories/ITokenRepository';
import type { TokenData } from '../../core/entities/TokenData';
import type { HashedToken } from '../../core/value-objects/HashedToken';

export class D1TokenRepository implements ITokenRepository {
  constructor(
    private readonly db: D1Database,
    private readonly tableName: string = 'auth_tokens'
  ) {}

  async findByHashedToken(hashedToken: HashedToken): Promise<TokenData | null> {
    throw new Error('Not implemented');
  }

  async create(token: TokenData): Promise<void> {
    throw new Error('Not implemented');
  }

  async deleteExpired(): Promise<void> {
    throw new Error('Not implemented');
  }

  async deleteByHashedToken(hashedToken: HashedToken): Promise<void> {
    throw new Error('Not implemented');
  }
}
```

#### src/d1/migrations/CreateAuthTables.ts
```typescript
import type { D1Database } from '@cloudflare/workers-types';

export class CreateAuthTables {
  static async up(db: D1Database): Promise<void> {
    // Create user_profiles table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        display_name TEXT,
        avatar_url TEXT,
        email TEXT,
        last_login_at INTEGER
      );
    `);

    // Create auth_providers table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS auth_providers (
        id TEXT PRIMARY KEY,
        provider_id TEXT NOT NULL,
        provider_type TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        last_login_at INTEGER,
        UNIQUE(provider_id, provider_type)
      );
    `);

    // Create auth_tokens table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id TEXT PRIMARY KEY,
        hashed_token TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // Create indices
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_auth_providers_user_id ON auth_providers(user_id);
      CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
    `);
  }

  static async down(db: D1Database): Promise<void> {
    await db.exec(`
      DROP TABLE IF EXISTS auth_tokens;
      DROP TABLE IF EXISTS auth_providers;
      DROP TABLE IF EXISTS user_profiles;
    `);
  }
}
```

#### src/d1/D1AuthCompositionRoot.ts
```typescript
import type { D1Database } from '@cloudflare/workers-types';
import { AuthenticationService } from '../core/services/AuthenticationService';
import { UserProfileService } from '../core/services/UserProfileService';
import { TokenService } from '../core/services/TokenService';
import { ProviderLinkingService } from '../core/services/ProviderLinkingService';
import { D1AuthProviderRepository } from './repositories/D1AuthProviderRepository';
import { D1UserProfileRepository } from './repositories/D1UserProfileRepository';
import { D1TokenRepository } from './repositories/D1TokenRepository';
import { GoogleAuthProvider } from '../google/GoogleAuthProvider';
import { GoogleTokenValidator } from '../google/GoogleTokenValidator';
import type { GoogleAuthConfig } from '../google/GoogleAuthConfig';
import { TokenHasher } from '../utils/TokenHasher';

export interface D1AuthCompositionRootConfig {
  db: D1Database;
  googleConfig: GoogleAuthConfig;
  tokenPepper: string;
}

export class D1AuthCompositionRoot {
  private readonly authenticationService: AuthenticationService;
  private readonly userProfileService: UserProfileService;
  private readonly tokenService: TokenService;
  private readonly providerLinkingService: ProviderLinkingService;
  private readonly googleAuthProvider: GoogleAuthProvider;

  constructor(config: D1AuthCompositionRootConfig) {
    // Initialize repositories
    const authProviderRepository = new D1AuthProviderRepository(config.db);
    const userProfileRepository = new D1UserProfileRepository(config.db);
    const tokenRepository = new D1TokenRepository(config.db);

    // Initialize utils
    const tokenHasher = new TokenHasher();

    // Initialize services
    this.providerLinkingService = new ProviderLinkingService(authProviderRepository);
    this.userProfileService = new UserProfileService(userProfileRepository);
    this.tokenService = new TokenService(
      tokenRepository,
      tokenHasher,
      config.tokenPepper
    );

    this.authenticationService = new AuthenticationService(
      authProviderRepository,
      userProfileRepository,
      this.providerLinkingService,
      this.userProfileService
    );

    // Initialize Google provider
    const googleTokenValidator = new GoogleTokenValidator(config.googleConfig.clientId);
    this.googleAuthProvider = new GoogleAuthProvider(
      config.googleConfig,
      googleTokenValidator
    );
  }

  getAuthenticationService(): AuthenticationService {
    return this.authenticationService;
  }

  getUserProfileService(): UserProfileService {
    return this.userProfileService;
  }

  getTokenService(): TokenService {
    return this.tokenService;
  }

  getProviderLinkingService(): ProviderLinkingService {
    return this.providerLinkingService;
  }

  getGoogleAuthProvider(): GoogleAuthProvider {
    return this.googleAuthProvider;
  }
}
```

### Utilities

#### src/utils/TokenHasher.ts
```typescript
export class TokenHasher {
  async hash(token: string, pepper: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async verify(token: string, hashedToken: string, pepper: string): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
```

#### src/utils/JwtDecoder.ts
```typescript
export class JwtDecoder {
  static decode<T = unknown>(token: string): T | null {
    throw new Error('Not implemented');
  }

  static extractPayload(token: string): string | null {
    throw new Error('Not implemented');
  }
}
```

#### src/utils/DateTimeProvider.ts
```typescript
export class DateTimeProvider {
  static now(): Date {
    return new Date();
  }

  static nowUnix(): number {
    return Math.floor(Date.now() / 1000);
  }

  static fromUnix(timestamp: number): Date {
    return new Date(timestamp * 1000);
  }

  static toUnix(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }
}
```

### Main Export

#### src/index.ts
```typescript
// Core entities
export * from './core/entities/AuthProvider';
export * from './core/entities/UserProfile';
export * from './core/entities/TokenData';

// Core repositories
export * from './core/repositories/IAuthProviderRepository';
export * from './core/repositories/IUserProfileRepository';
export * from './core/repositories/ITokenRepository';

// Core services
export * from './core/services/AuthenticationService';
export * from './core/services/UserProfileService';
export * from './core/services/TokenService';
export * from './core/services/ProviderLinkingService';

// Core value objects
export * from './core/value-objects/ProviderId';
export * from './core/value-objects/UserId';
export * from './core/value-objects/ProviderType';
export * from './core/value-objects/HashedToken';

// Core errors
export * from './core/errors/AuthenticationError';
export * from './core/errors/InvalidTokenError';
export * from './core/errors/ProviderNotLinkedError';
export * from './core/errors/UserNotFoundError';

// Google implementation
export * from './google/GoogleAuthProvider';
export * from './google/GoogleTokenValidator';
export * from './google/GoogleJwtPayload';
export * from './google/GoogleAuthConfig';

// D1 implementation
export * from './d1/D1AuthCompositionRoot';
export * from './d1/migrations/CreateAuthTables';

// Utils
export * from './utils/TokenHasher';
export * from './utils/JwtDecoder';
export * from './utils/DateTimeProvider';
```

### Package Configuration

#### package.json
```json
{
  "name": "@interslavic/database-engine-auth",
  "version": "0.1.0",
  "description": "Authentication and authorization subpackage for database engine",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf dist",
    "test": "vitest"
  },
  "dependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "jose": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "@interslavic/database-engine-eventstore": "workspace:*"
  }
}
```