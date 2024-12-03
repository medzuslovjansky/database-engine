export type SynsetsArgv = PullArgv | PushArgv | RebuildArgv;
export type SynsetsArgvAny = PullArgv & PushArgv & RebuildArgv;

export type PullArgv = {
  subcommand: 'pull';
  partial: boolean;
  only: boolean;
  source: string;
  _: string[];
};

export type PushArgv = {
  subcommand: 'push';
  partial: boolean;
  note: string;
  only: boolean;
  _: string[];
};

export type RebuildArgv = {
  subcommand: 'rebuild';
};
