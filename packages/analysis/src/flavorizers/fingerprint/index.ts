import * as pl from './pl';

export default {
  get isv2pl() {
    return pl.isv();
  },

  get pl() {
    return pl.pl();
  },
};
