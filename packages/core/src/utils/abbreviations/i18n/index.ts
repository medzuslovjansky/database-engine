import type { Language } from '../../../constants';
import type { Translations } from './type';

import { bg } from './bg';
import { be } from './be';
import { cs } from './cs';
import { en } from './en';
import { hr } from './hr';
import { isv } from './isv';
import { mk } from './mk';
import { pl } from './pl';
import { ru } from './ru';
import { sk } from './sk';
import { sl } from './sl';
import { sr } from './sr';
import { uk } from './uk';

export * from './type';
export default { bg, be, cs, en, hr, isv, mk, pl, ru, sk, sl, sr, uk } as Record<Language, Translations>;
