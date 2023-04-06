import path from 'node:path';

import once from 'lodash/once';

import { Config } from './Config';

const currentDirectory = __dirname;
const databaseDirectory = path.join(currentDirectory, '..', 'db');

export const config = new Config(databaseDirectory);
export const loadConfig = once(() => config.load());
