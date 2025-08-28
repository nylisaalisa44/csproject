const TestSequencer = require('@jest/test-sequencer').default;

class CustomTestSequencer extends TestSequencer {
  sort(tests) {
    // Сначала запускаем unit тесты, затем интеграционные
    return tests.sort((testA, testB) => {
      const isUnitA = testA.path.includes('unit');
      const isUnitB = testB.path.includes('unit');
      
      if (isUnitA && !isUnitB) return -1;
      if (!isUnitA && isUnitB) return 1;
      
      // Если оба unit или оба integration, сортируем по алфавиту
      return testA.path.localeCompare(testB.path);
    });
  }
}

module.exports = CustomTestSequencer;
