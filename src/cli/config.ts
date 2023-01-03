import crypto from 'crypto';
import fs from 'fs';

import _ from 'lodash';
import { CommandBuilder } from 'yargs';
import yaml from 'yaml';

export const command = 'config [options]';

export const describe = 'Edit the configuration file';

export const handler = async (argv: ConfigOptions) => {
  const encryptionKey =
    argv.encryptionKey ??
    process.env.ISV_ENCRYPTION_KEY ??
    (await fs.promises.readFile('.config_encryption_key', 'utf8'));

  const decryptionKey = argv.decryptionKey ?? encryptionKey;

  const rawConfig = await fs.promises.readFile(argv.configFile, 'utf8');
  const encryptedConfig = yaml.parse(rawConfig) as SheetsConfig;
  encryptedConfig.users ??= {};

  const config = {
    ...encryptedConfig,
    users: _.mapValues(encryptedConfig.users, (user) => ({
      ...user,
      email: decrypt(user.email, decryptionKey),
    })),
  };

  if (argv.user) {
    if (addUser(config.users, argv.user)) {
      addUser(encryptedConfig.users, {
        ...argv.user,
        email: encrypt(argv.user.email, encryptionKey),
      });
    }
  }

  if (argv.print) {
    console.log(config);
  }

  await fs.promises.writeFile(argv.configFile, yaml.stringify(encryptedConfig));
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

  return true;
}

function encrypt(plaintext: string, key: string) {
  if (!plaintext) return plaintext;

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
  if (!encryption) return encryption;

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
