module.exports = {
  ...require('@interslavic/jest-config-cli'),

  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/$1'
  },
};
