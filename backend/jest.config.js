module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/scripts/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 60000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Настройки для последовательного запуска тестов
  maxWorkers: 1,
  // Настройки для лучшей изоляции тестов
  testSequencer: '<rootDir>/tests/testSequencer.js',
  // Настройки для отладки
  verbose: true,
  // Отключаем кэширование
  cache: false
};
