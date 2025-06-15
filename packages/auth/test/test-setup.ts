import { createAuthCompositionRoot } from '@auth/composition-root';
import { D1UnitOfWork } from '@auth/d1';

export type TestContext = Awaited<ReturnType<typeof setupTestContext>>;

export async function setupTestContext() {
  const db = globalThis.__MINIFLARE_DB__;

  const compositionRoot = createAuthCompositionRoot({
    db,
    tokenPepper: 'test-pepper'
  });

  await compositionRoot.migrations.reset();

  return {
    db,
    authService: compositionRoot.authService,
    migrations: compositionRoot.migrations,
    pepper: compositionRoot.pepper,
    patAuthProvider: compositionRoot.patAuthProvider,

    // Unit of Work factory
    createUnitOfWork: () => new D1UnitOfWork({ db }),

    // Query instances
    userProfileQuery: compositionRoot.userProfileQuery,
    authProviderLinkQuery: compositionRoot.authProviderLinkQuery,
    patTokenQuery: compositionRoot.patTokenQuery,

    // Stager factories from composition root
    userProfileStagerFactory: compositionRoot.userProfileStagerFactory,
    authProviderLinkStagerFactory: compositionRoot.authProviderLinkStagerFactory,
    patTokenStagerFactory: compositionRoot.patTokenStagerFactory,

    // Helper method to create a complete set of stagers with shared UoW
    createStagers: () => {
      const unitOfWork = new D1UnitOfWork({ db });
      return {
        unitOfWork,
        userProfileStager: compositionRoot.userProfileStagerFactory(unitOfWork),
        authProviderLinkStager: compositionRoot.authProviderLinkStagerFactory(unitOfWork),
        patTokenStager: compositionRoot.patTokenStagerFactory(unitOfWork)
      };
    }
  };
}
