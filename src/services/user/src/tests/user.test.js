// src/tests/user.test.js
const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const { hashPassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

let adminToken;
let customerToken;
let testUserId;
let adminUserId;

beforeAll(async () => {
  // Limpa tabela users antes dos testes
  await db.query('DELETE FROM users');

  // Cria usuário admin
  const adminPasswordHash = await hashPassword('Admin1234');
  const adminResult = await db.query(
    `INSERT INTO users (id, name, email, password_hash, role, created_at, active)
     VALUES (gen_random_uuid(), $1, $2, $3, 'admin', NOW(), true)
     RETURNING id`,
    ['Admin', 'admin@test.com', adminPasswordHash]
  );
  adminUserId = adminResult.rows[0].id;
  adminToken = generateToken({ id: adminUserId, email: 'admin@test.com', role: 'admin' });

  // Cria usuário customer
  const customerPasswordHash = await hashPassword('Customer123');
  const customerResult = await db.query(
    `INSERT INTO users (id, name, email, password_hash, role, created_at, active)
     VALUES (gen_random_uuid(), $1, $2, $3, 'customer', NOW(), true)
     RETURNING id`,
    ['Customer', 'customer@test.com', customerPasswordHash]
  );
  testUserId = customerResult.rows[0].id;
  customerToken = generateToken({ id: testUserId, email: 'customer@test.com', role: 'customer' });
});

afterAll(async () => {
  await db.query('DELETE FROM users');
  await db.end();
});

describe('User Endpoints', () => {

  it('Admin: should list all users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it('Customer: should NOT list all users', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('Customer: should get own profile', async () => {
    const res = await request(app)
      .get(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe('customer@test.com');
  });

  it('Customer: should NOT get another user profile', async () => {
    const res = await request(app)
      .get(`/users/${adminUserId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('Customer: should update own profile', async () => {
    const res = await request(app)
      .put(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Customer Updated', email: 'cust_updated@test.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe('Customer Updated');
  });

  it('Customer: should update own password', async () => {
    const res = await request(app)
      .put(`/users/${testUserId}/password`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ password: 'NewPass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Senha atualizada com sucesso');
  });

  it('Customer: should NOT update another user profile', async () => {
    const res = await request(app)
      .put(`/users/${adminUserId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Hack', email: 'hack@test.com' });
    expect(res.statusCode).toBe(403);
  });

  it('Customer: should delete (deactivate) own account', async () => {
    const res = await request(app)
      .delete(`/users/${testUserId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Usuário desativado com sucesso');
  });

  it('Admin: should delete another user account', async () => {
    const res = await request(app)
      .delete(`/users/${adminUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Usuário desativado com sucesso');
  });

});