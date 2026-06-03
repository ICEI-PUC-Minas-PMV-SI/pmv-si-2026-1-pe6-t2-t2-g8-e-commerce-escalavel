const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');

describe('Auth Endpoints', () => {
  let userEmail = `test${Date.now()}@example.com`;
  let userPassword = '12345678';
  let token;

  afterAll(async () => {
    // Limpar usuário criado
    await db.query('DELETE FROM users WHERE email = $1', [userEmail]);
    await db.end();
  });

  test('Register new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: userEmail,
        password: userPassword,
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe(userEmail);

    token = res.body.data.token;
  });

  test('Login user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: userEmail,
        password: userPassword,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.token).toBeDefined();
  });
});