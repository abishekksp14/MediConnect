const mongoose = require('mongoose');
const User = require('../models/User');

describe('User Model Test', () => {
  it('should be invalid if required fields are empty', () => {
    const user = new User();
    const error = user.validateSync();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  it('should be valid when required fields are provided', () => {
    const user = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });
    const error = user.validateSync();
    expect(error).toBeUndefined();
  });
});
