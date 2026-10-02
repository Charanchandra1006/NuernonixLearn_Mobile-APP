module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'detox/runners/jest/testEnvironment',
  testMatch: ['<rootDir>/**/*.test.ts'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: ['detox/runners/jest/reporter'],
  verbose: true,
};
