export type SynsetsArgv = PullArgv | PushArgv | RebuildArgv | RefineArgv;
export type SynsetsArgvAny = PullArgv & PushArgv & RebuildArgv & RefineArgv;

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

export type RefineArgv = {
  subcommand: 'refine';
  mode: 'spelling' | 'translations';
  lang?: string[];
  dryRun: boolean;
  only: boolean;
  _: string[];
};
