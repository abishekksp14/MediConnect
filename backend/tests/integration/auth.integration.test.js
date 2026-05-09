const request = require('supertest');
const { app } = require('../../app');
const mongoose = require('mongoose');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('Auth Integration (Mocked DB)', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: '123',
        name: 'Integration User',
        email: 'int@example.com',
        role: 'patient',
        save: jest.fn()
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration User',
          email: 'int@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.email).toEqual('int@example.com');
    });
  });
});
