// backend/tests/routes.test.js
describe('Route Tests', () => {
  test('Health check route should exist', () => {
    // Просто проверяем что маршруты загружаются без ошибок
    expect(() => {
      require('../routes/auth');
      require('../routes/doctors');
      require('../routes/appointments');
    }).not.toThrow();
  });

  test('Route files should export functions', () => {
    const authRoutes = require('../routes/auth');
    const doctorRoutes = require('../routes/doctors');
    
    expect(typeof authRoutes).toBe('function');
    expect(typeof doctorRoutes).toBe('function');
  });
});