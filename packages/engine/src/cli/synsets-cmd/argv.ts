export type SynsetsArgv = PullArgv | PushArgv | RebuildArgv;
export type SynsetsArgvAny = PullArgv & PushArgv & RebuildArgv;

export type PullArgv = {
  subcommand: 'pull';
  beta: boolean;
};

export type PushArgv = {
  subcommand: 'push';
  beta: boolean;
  _: string[];
};

export type RebuildArgv = {
  subcommand: 'rebuild';
};
