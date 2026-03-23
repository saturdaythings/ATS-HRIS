module.exports = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  transform: {
    '^.+\\.jsx?$': ['babel-jest', { presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-react'] }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js',
    '!server/db.js',
    '!server/tests/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: ['**/server/tests/**/*.test.js'],
  verbose: true,
};
