import type { CommandRegistry } from '../types';

export type CommandHandler<C> = (command: C) => void | Promise<void>;

export interface CommandBus<R extends CommandRegistry = CommandRegistry> {
  dispatch<K extends keyof R>(type: K, command: R[K]): Promise<void>;
  register<K extends keyof R>(type: K, handler: CommandHandler<R[K]>): this;
}
