import crypto from 'crypto';
import fs from 'fs';

import {CommandBuilder} from 'yargs';
import yaml from 'yaml';

export const command = 'config [options]';

export const describe = 'Edit the configuration file';

export const handler = async (argv: ConfigOptions) => {
  const rawConfig = await fs.promises.readFile(argv.configFile, 'utf8');
  const config = yaml.parse(rawConfig) as SheetsConfig;
  config.users ??= {};

  const encryptionKey =
    argv.encryptionKey ??
    process.env.ISV_ENCRYPTION_KEY ??
    (await fs.promises.readFile('.config_encryption_key', 'utf8'));

  const decryptionKey = argv.decryptionKey ?? encryptionKey;

  Object.values(config.users).forEach((user) => {
    if (user.email) {
      user.email = decrypt(user.email, decryptionKey);
    }
  });

  addUser(config.users, argv.user);

  if (argv.print) {
    console.log(config);
  }

  Object.values(config.users).forEach((user) => {
    if (user.email) {
      user.email = encrypt(user.email, encryptionKey);
    }
  });

  await fs.promises.writeFile(argv.configFile, yaml.stringify(config));
};

function addUser(
  users: Record<string, UserConfig>,
  user: ConfigOptions['user'],
) {
  if (!user) return;
  if (!user.id) return;
  if (!user.email) return;

  if (users[user.id]) {
    users[user.id] = { ...users[user.id], email: user.email };
  } else {
    users[user.id] = { email: user.email, role: 'editor' };
  }
}

function encrypt(plaintext: string, key: string) {
  const initVector = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-ctr',
    Buffer.from(key, 'hex'),
    initVector,
  );

  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return `${initVector.toString('base64')}.${encrypted.toString('base64')}`;
}

function decrypt(encryption: string, key: string) {
  const [iv, encrypted] = encryption.split('.');
  const decipher = crypto.createDecipheriv(
    'aes-256-ctr',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'base64'),
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString();
}

export const builder: CommandBuilder<ConfigOptions, any> = {
  configFile: {
    alias: 'c',
    default: 'sheets.config.yml',
    describe: 'The configuration file to edit',
  },
  user: {
    description: 'User details to add or modify',
  },
  decryptionKey: {
    description:
      'Use when you need to re-encrypt the config file with a new key',
  },
  encryptionKey: {
    description:
      'Override the encryption key used to encrypt PIIs in the configuration file',
  },
  print: {
    alias: 'p',
    description: 'Print the configuration file',
    boolean: true,
  },
};

export type ConfigOptions = {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
  decryptionKey?: string;
  encryptionKey?: string;
  configFile: string;
  print: boolean;
};

type SheetsConfig = {
  users: Record<string, UserConfig>;
  ranges: RangeConfig[];
};

type UserConfig = {
  email: string;
  role: 'editor' | 'owner' | 'commenter' | 'reader';
};

type RangeConfig = {
  name: string;
  range: string;
  warn: boolean;
  editors: Array<keyof SheetsConfig['users']>;
};
