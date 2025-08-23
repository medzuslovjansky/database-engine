import type { D1Database } from '@cloudflare/workers-types';
import { D1UnitOfWork } from '@interslavic/database-engine-database-d1';
import type {
  UserProfileQuery,
  AuthProviderLinkQuery,
  PATTokenQuery,
  StagerFactory,
  UserProfileStager,
  AuthProviderLinkStager,
  PATTokenStager,
  UnitOfWork
} from '@interslavic/database-engine-auth';
import { AuthService, DefaultDateTimeProvider, SHA256Pepper, PATAuthProviderImpl } from '@interslavic/database-engine-auth';

import {
  D1Consts,
  D1AuthMigrations,
  // Queries
  D1UserProfileQuery,
  D1AuthProviderLinkQuery,
  D1PATTokenQuery,
  // Stagers
  D1UserProfileStager,
  D1AuthProviderLinkStager,
  D1PATTokenStager
} from './';

export interface D1AuthCompositionRootConfig {
  db: D1Database;
  tokenPepper: string;
}

export function createD1AuthCompositionRoot(config: D1AuthCompositionRootConfig) {
  const pepper = new SHA256Pepper({ secret: config.tokenPepper });
  const dateTimeProvider = new DefaultDateTimeProvider();
  const d1UnitOfWork = new D1UnitOfWork({ db: config.db });

  const migrations = new D1AuthMigrations({
    db: config.db,
    tableName: D1Consts.MIGRATIONS_TABLE_NAME,
  });

  // Create query instances (read-only, no UoW dependency)
  const userProfileQuery: UserProfileQuery = new D1UserProfileQuery({
    db: config.db,
    tableName: D1Consts.USER_PROFILES_TABLE_NAME
  });

  const authProviderLinkQuery: AuthProviderLinkQuery = new D1AuthProviderLinkQuery({
    db: config.db,
    tableName: D1Consts.AUTH_PROVIDERS_TABLE_NAME
  });

  const patTokenQuery: PATTokenQuery = new D1PATTokenQuery({
    db: config.db,
    tokensTableName: D1Consts.PAT_TOKENS_TABLE_NAME,
    providersTableName: D1Consts.AUTH_PROVIDERS_TABLE_NAME
  });

  // Create stager factory functions
  const userProfileStagerFactory: StagerFactory<UserProfileStager> = D1UserProfileStager.createFactory({
    db: config.db,
    tableName: D1Consts.USER_PROFILES_TABLE_NAME,
    dateTimeProvider
  });

  const authProviderLinkStagerFactory: StagerFactory<AuthProviderLinkStager> = D1AuthProviderLinkStager.createFactory({
    db: config.db,
    tableName: D1Consts.AUTH_PROVIDERS_TABLE_NAME,
    dateTimeProvider
  });

  const patTokenStagerFactory: StagerFactory<PATTokenStager> = D1PATTokenStager.createFactory({
    db: config.db,
    tableName: D1Consts.PAT_TOKENS_TABLE_NAME
  });

  const patAuthProvider = new PATAuthProviderImpl({
    authProviderLinkQuery,
    userProfileQuery,
    patTokenQuery,
    userProfileStagerFactory,
    authProviderLinkStagerFactory,
    patTokenStagerFactory,
    createUnitOfWork: (): UnitOfWork => new D1UnitOfWork({ db: config.db }),
    pepper
  });

  const authService = new AuthService();
  authService.registerProvider('pat', patAuthProvider);

  return {
    migrations,
    unitOfWork: d1UnitOfWork,
    authService,
    patAuthProvider,
    pepper,
    // Stager factories for external use
    userProfileStagerFactory,
    userProfileQuery,
    authProviderLinkStagerFactory,
    authProviderLinkQuery,
    patTokenStagerFactory,
    patTokenQuery,
  };
}
