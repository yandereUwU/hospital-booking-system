// backend/tests/setup.js
const path = require('path');

// Загружаем environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

console.log('✅ Tests setup loaded');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***set***' : 'NOT SET');

// Глобальные настройки для тестов
jest.setTimeout(30000);

// Простые моки если нужны, но лучше избегать сложных моков
global.console = {
  ...console,
  // log: jest.fn(), // НЕ мокаем - это вызывает проблемы
  // error: jest.fn(),
};

// Глобальные переменные для тестов
global.TEST_MODE = true;

// Очистка после тестов
afterAll(() => {
  // Любая необходимая очистка
});