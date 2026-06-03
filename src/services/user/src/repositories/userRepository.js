// src/repositories/userRepository.js
const db = require('../db/connection');

// Cria usuário com endereço opcional
const createUser = async ({ name, email, passwordHash, role, cpf, phone, address }) => {
  const query = `
    INSERT INTO users (
      id, name, email, password_hash, role, created_at, active,
      cpf, phone,
      address_street, address_city, address_state, address_zip
    )
    VALUES (
      gen_random_uuid(), $1, $2, $3, $4, NOW(), true, $5, $6, $7, $8, $9, $10
    )
    RETURNING id, name, email, role, created_at, active,
              cpf, phone,
              address_street,
              address_city,
              address_state,
              address_zip
  `;

  const values = [
    name,
    email,
    passwordHash,
    role,
    cpf || null,
    phone || null,
    address?.street || null,
    address?.city || null,
    address?.state || null,
    address?.zip || null,
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

// Busca usuário por e-mail
const findByEmail = async (email) => {
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
};

// Retorna todos usuários ativos
const getAllUsers = async () => {
  const result = await db.query(
    `SELECT id, name, email, cpf, phone, role, created_at,
            address_street, address_city, address_state, address_zip
     FROM users
     WHERE active = true`
  );
  return result.rows;
};

// Retorna TODOS os usuários (ativos e inativos) — uso exclusivo do admin
const getAllUsersAdmin = async () => {
  const result = await db.query(
    `SELECT id, name, email, cpf, phone, role, created_at, active,
            address_street, address_city, address_state, address_zip
     FROM users
     ORDER BY created_at DESC`
  );
  return result.rows;
};

// Retorna usuário por ID
const findById = async (id) => {
  const result = await db.query(
    `SELECT id, name, email, cpf, phone, role, created_at,
            address_street,
            address_city,
            address_state,
            address_zip
     FROM users
     WHERE id = $1 AND active = true`,
    [id]
  );
  return result.rows[0];
};

// Atualiza usuário (dinâmico - só campos enviados)
const update = async (id, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const key in data) {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index++;
  }

  // evita query inválida
  if (fields.length === 0) {
    return null;
  }

  values.push(id);

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = $${index}
    RETURNING id, name, email, cpf, phone, role, created_at,
              address_street,
              address_city,
              address_state,
              address_zip;
  `;

  const result = await db.query(query, values);
  return result.rows[0];
};

// Atualiza senha
const updatePassword = async (id, passwordHash) => {
  await db.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, id]
  );
};

// Desativa usuário (soft delete)
const deactivate = async (id) => {
  await db.query('UPDATE users SET active = false WHERE id = $1', [id]);
};

// Reativa usuário — uso exclusivo do admin
const reactivate = async (id) => {
  await db.query('UPDATE users SET active = true WHERE id = $1', [id]);
};

// Exclusão definitiva (hard delete) — uso exclusivo do admin
const hardDelete = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
};

module.exports = {
  createUser,
  findByEmail,
  getAllUsers,
  getAllUsersAdmin,
  findById,
  update,
  updatePassword,
  deactivate,
  reactivate,
  hardDelete,
};