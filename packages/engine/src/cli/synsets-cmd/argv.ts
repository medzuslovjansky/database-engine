export type SynsetsArgv = PullArgv | PushArgv | RebuildArgv;
export type SynsetsArgvAny = PullArgv & PushArgv & RebuildArgv;

export type PullArgv = {
  subcommand: 'pull';
  beta: boolean;
  only: boolean;
  _: string[];
};

export type PushArgv = {
  subcommand: 'push';
  beta: boolean;
  only: boolean;
  _: string[];
};

export type RebuildArgv = {
  subcommand: 'rebuild';
};
