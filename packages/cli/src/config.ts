import type { CommandBuilder } from 'yargs';
import { loadConfig } from '@interslavic/razumlivost-database';

export const command = 'config [options]';

export const describe = 'Edit the configuration file';

export const handler = async (argv: ConfigOptions) => {
  const configManager = await loadConfig();

  if (argv.user) {
    configManager.users.addUser(argv.user.id, {
      email: argv.user.email,
      comment: '',
    });

    await configManager.save();
  }

  if (argv.print) {
    console.log(configManager.config);
  }
};

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
    role?: 'editor' | 'owner' | 'commenter' | 'reader';
  };
  decryptionKey?: string;
  encryptionKey?: string;
  configFile: string;
  print: boolean;
};
