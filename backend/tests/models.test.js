// backend/tests/models.test.js
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

describe('Model Tests', () => {
  test('User model should exist', () => {
    expect(User).toBeDefined();
  });

  test('Doctor model should exist', () => {
    expect(Doctor).toBeDefined();
  });

  test('Appointment model should exist', () => {
    expect(Appointment).toBeDefined();
  });

  test('User should have create method', () => {
    expect(typeof User.create).toBe('function');
  });

  test('Doctor should have findAll method', () => {
    expect(typeof Doctor.findAll).toBe('function');
  });
});