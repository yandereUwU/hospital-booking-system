// backend/tests/utils.test.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Utility Tests', () => {
  test('bcrypt should hash passwords', async () => {
    const password = 'test123';
    const hashed = await bcrypt.hash(password, 10);
    
    expect(hashed).not.toBe(password);
    expect(hashed.length).toBeGreaterThan(10);
  });

  test('JWT should create tokens', () => {
    const payload = { id: 1, username: 'test' };
    const token = jwt.sign(payload, 'test-secret');
    
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });

  test('Date validation should work', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    expect(futureDate > new Date()).toBe(true);
    expect(pastDate < new Date()).toBe(true);
  });
});