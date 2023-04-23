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

export default async function createCompositionRoot() {
  await loadEnv();

  const cryptoService = createCryptoService();
  const fileDatabase = new FileDatabase({
    rootDirectory: process.env.ISV_DATABASE_ROOT ?? process.cwd(),
    cryptoService,
  });

  const authClient = await createAuthClient();
  if (!authClient) {
    throw new Error('Cannot find credentials to authorize with Google APIs');
  }

  const googleAPIs = new GoogleAPIs({ authClient });

  return {
    fileDatabase,
    googleAPIs,
  };
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
