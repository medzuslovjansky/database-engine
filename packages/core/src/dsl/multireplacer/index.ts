import { MultireplacerBuilder } from './MultireplacerBuilder';
import type { IMultireplacerWrapper } from './MultireplacerWrapper';

export { MultireplacerBuilder, IMultireplacerWrapper };

export default {
  named(name: string) {
    return new MultireplacerBuilder({ name });
  },
};
