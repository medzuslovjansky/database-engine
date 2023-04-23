import type { CommandBuilder } from 'yargs';
import type { User } from '@interslavic/database-engine-fs';

import compose from '../compositionRoot';

export const command = 'users <subcommand> [options]';

export const describe = 'Edit the configuration file';

export const handler = async (argv: ConfigOptions) => {
  const { fileDatabase } = await compose();

  switch (argv.subcommand) {
    case 'list': {
      return list();
    }
    case 'add': {
      return add();
    }
    case 'update': {
      return update();
    }
    case 'remove': {
      return remove();
    }
  }

  async function add() {
    if (argv.user) {
      await fileDatabase.users.upsert(argv.user);
    }
  }

  async function list() {
    const users = await fileDatabase.users.values();
    console.log(users);
  }

  async function update() {
    if (argv.user && argv.user.id) {
      await fileDatabase.users.update(argv.user.id, argv.user);
    }
  }

  async function remove() {
    const id = argv.user?.id;
    if (id) {
      await fileDatabase.users.deleteById(id);
    }
  }
};

export const builder: CommandBuilder<ConfigOptions, any> = {
  subcommand: {
    choices: ['add', 'remove', 'update', 'list'],
    description: 'Subcommand to execute',
    demandOption: true,
  },
  user: {
    description: 'User details to add or modify',
  },
};

export type ConfigOptions = {
  subcommand: 'add' | 'remove' | 'update' | 'list';
  user?: User;
};
