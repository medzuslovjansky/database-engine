import { MultireplacerBuilder } from './MultireplacerBuilder';

export default {
  named(name: string) {
    return new MultireplacerBuilder({ name });
  },
};
