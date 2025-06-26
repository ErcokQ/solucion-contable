const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
     '^@shared/(.*)$': '<rootDir>/src/shared/$1',
     '^@auth/(.*)$':   '<rootDir>/src/modules/auth/$1',
      '^@cfdi/(.*)$':  '<rootDir>/src/modules/cfdi/$1',
      '^@payments/(.*)$': '<rootDir>/src/modules/payments/$1',
      '^@payroll/(.*)$': '<rootDir>/src/modules/payroll/$1',
  },
};