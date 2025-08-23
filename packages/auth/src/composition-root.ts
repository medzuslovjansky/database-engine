import { PATAuthProviderImpl } from '@auth/pat';
import { DefaultDateTimeProvider, SHA256Pepper } from '@auth/utils';

import type {
  AuthProviderLinkQuery,
  UserProfileQuery,
  StagerFactory,
  UserProfileStager,
  AuthProviderLinkStager,
  PATTokenStager,
  UnitOfWork
} from './core';
import type { PATTokenQuery } from './pat/core';
import { AuthService } from './AuthService';

export interface AuthCompositionRootConfig {
  tokenPepper: string;
  // Generic interfaces that implementations can provide
  userProfileQuery: UserProfileQuery;
  authProviderLinkQuery: AuthProviderLinkQuery;
  patTokenQuery: PATTokenQuery;
  userProfileStagerFactory: StagerFactory<UserProfileStager>;
  authProviderLinkStagerFactory: StagerFactory<AuthProviderLinkStager>;
  patTokenStagerFactory: StagerFactory<PATTokenStager>;
  createUnitOfWork: () => UnitOfWork;
}

export function createAuthCompositionRoot(config: AuthCompositionRootConfig) {
  const pepper = new SHA256Pepper({ secret: config.tokenPepper });
  const dateTimeProvider = new DefaultDateTimeProvider();

  const patAuthProvider = new PATAuthProviderImpl({
    authProviderLinkQuery: config.authProviderLinkQuery,
    userProfileQuery: config.userProfileQuery,
    patTokenQuery: config.patTokenQuery,
    userProfileStagerFactory: config.userProfileStagerFactory,
    authProviderLinkStagerFactory: config.authProviderLinkStagerFactory,
    patTokenStagerFactory: config.patTokenStagerFactory,
    createUnitOfWork: config.createUnitOfWork,
    pepper
  });

  const authService = new AuthService();
  authService.registerProvider('pat', patAuthProvider);

  return {
    authService,
    patAuthProvider,
    pepper,
    dateTimeProvider,
    // Stager factories for external use
    userProfileStagerFactory: config.userProfileStagerFactory,
    userProfileQuery: config.userProfileQuery,
    authProviderLinkStagerFactory: config.authProviderLinkStagerFactory,
    authProviderLinkQuery: config.authProviderLinkQuery,
    patTokenStagerFactory: config.patTokenStagerFactory,
    patTokenQuery: config.patTokenQuery,
  };
}
