import type { D1Database } from '@cloudflare/workers-types';
import { D1Consts, D1UnitOfWork, D1PATTokenRepository, D1UserProfileRepository, D1AuthProviderLinkRepository, D1AuthMigrations } from '@auth/d1';
import { PATAuthProviderImpl } from '@auth/pat';
import { DefaultDateTimeProvider, SHA256Pepper } from '@auth/utils';

import { AuthService } from './AuthService';

export interface D1AuthCompositionRootConfig {
  db: D1Database;
  tokenPepper: string;
}

export function createAuthCompositionRoot(config: D1AuthCompositionRootConfig) {
  const pepper = new SHA256Pepper({ secret: config.tokenPepper });
  const dateTimeProvider = new DefaultDateTimeProvider();
  const unitOfWork = new D1UnitOfWork({ db: config.db });

  const migrations = new D1AuthMigrations({
    db: config.db,
    migrationsTableName: D1Consts.MIGRATIONS_TABLE_NAME,
  });

  const tokenRepository = new D1PATTokenRepository({
    db: config.db,
    unitOfWork,
    dateTimeProvider,
    tokensTableName: D1Consts.PAT_TOKENS_TABLE_NAME,
    providersTableName: D1Consts.AUTH_PROVIDERS_TABLE_NAME
  });

  const userProfileRepository = new D1UserProfileRepository({
    db: config.db,
    unitOfWork,
    dateTimeProvider,
    tableName: D1Consts.USER_PROFILES_TABLE_NAME
  });

  const authProviderLinkRepository = new D1AuthProviderLinkRepository({
    db: config.db,
    unitOfWork,
    dateTimeProvider,
    tableName: D1Consts.AUTH_PROVIDERS_TABLE_NAME
  });

  const patTokenRepository = new D1PATTokenRepository({
    db: config.db,
    unitOfWork,
    dateTimeProvider,
    tokensTableName: D1Consts.PAT_TOKENS_TABLE_NAME,
    providersTableName: D1Consts.AUTH_PROVIDERS_TABLE_NAME
  });

  const patAuthProvider = new PATAuthProviderImpl({
    authProviderLinkRepository,
    userProfileRepository,
    patTokenRepository,
    pepper
  });

  const authService = new AuthService();
  authService.registerProvider('pat', patAuthProvider);

  return {
    migrations,
    unitOfWork,
    authService,
    patAuthProvider,
    userProfileRepository,
    tokenRepository,
    authProviderLinkRepository,
  };
}
