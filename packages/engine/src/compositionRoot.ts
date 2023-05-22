import * as dotenv from 'dotenv';
import findUp from 'find-up';
import {
  FileDatabase,
  NoCryptoService,
  AES256CTRService,
} from '@interslavic/database-engine-fs';
import {
  createAuthClient,
  GoogleAPIs,
} from '@interslavic/database-engine-google';

export type CompositionRootOptions = {
  offline?: boolean;
};

export type CompositionRoot = {
  fileDatabase: FileDatabase;
  googleAPIs?: GoogleAPIs;
};

async function createCompositionRoot(): Promise<Required<CompositionRoot>>;
async function createCompositionRoot(
  options: CompositionRootOptions,
): Promise<CompositionRoot>;
async function createCompositionRoot(
  options: CompositionRootOptions = {},
): Promise<CompositionRoot> {
  await loadEnv();

  const root: Partial<CompositionRoot> = {};
  const cryptoService = createCryptoService();
  const rootDirectory = process.env.ISV_DATABASE_ROOT ?? process.cwd();
  const fileDatabase = await FileDatabase.create({
    rootDirectory,
    cryptoService,
  });

  root.fileDatabase = fileDatabase;

  if (options.offline !== true) {
    const authClient = await createAuthClient(rootDirectory);
    if (!authClient) {
      throw new Error('Cannot find credentials to authorize with Google APIs');
    }

    const googleAPIs = new GoogleAPIs({ authClient });
    root.googleAPIs = googleAPIs;
  }

  return root as CompositionRoot;
}

function createCryptoService() {
  return process.env.ISV_ENCRYPTION_KEY && process.env.ISV_ENCRYPTION_IV
    ? new AES256CTRService(
        process.env.ISV_ENCRYPTION_KEY,
        process.env.ISV_ENCRYPTION_IV,
      )
    : new NoCryptoService();
}

async function loadEnv() {
  const envPath = await findUp('.env');

  if (envPath) {
    const env = dotenv.config({ path: envPath });
    if (env.error) {
      throw env.error;
    }
  }
}

export default createCompositionRoot;
