module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },

  moduleFileExtensions: ["js", "jsx"],

  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  transformIgnorePatterns: [
    "/node_modules/(?!(axios|some-esm-lib)/)"
  ],
    // ... your existing config
    collectCoverageFrom: [
      'src/**/*.{js,jsx}',
      '!src/main.jsx',  
      '!src/App.jsx',  
      '!src/pages/Dashboard.jsx',
      '!src/components/common/ErrorBoundary.jsx',
      '!src/**/__tests__/**',    // exclude test files themselves
    ],
    coverageThreshold: {
      global: {
        branches: 85,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
    coverageReporters: ['text', 'text-summary', 'lcov'],
};