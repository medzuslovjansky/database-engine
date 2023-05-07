import beGenerator from './be';
import bgGenerator from './bg';
import csGenerator from './cs';
import hrGenerator from './hr';
import mkGenerator from './mk';
import plGenerator from './pl';
import ruGenerator from './ru';
import skGenerator from './sk';
import slGenerator from './sl';
import srGenerator from './sr';
import ukGenerator from './uk';

export default {
  get be() {
    return beGenerator();
  },
  get bg() {
    return bgGenerator();
  },
  get cs() {
    return csGenerator();
  },
  get hr() {
    return hrGenerator();
  },
  get mk() {
    return mkGenerator();
  },
  get pl() {
    return plGenerator();
  },
  get ru() {
    return ruGenerator();
  },
  get sk() {
    return skGenerator();
  },
  get sl() {
    return slGenerator();
  },
  get sr() {
    return srGenerator();
  },
  get uk() {
    return ukGenerator();
  },
};
