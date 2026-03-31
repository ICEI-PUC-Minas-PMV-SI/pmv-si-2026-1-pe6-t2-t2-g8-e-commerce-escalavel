// src/repositories/userRepository.js
const db = require('../db/connection');

// Cria usuário com endereço opcional
const createUser = async ({ name, email, passwordHash, role, address }) => {
  const query = `
    INSERT INTO users (
      id, name, email, password_hash, role, created_at, active,
      address_street, address_city, address_state, address_zip
    )
    VALUES (
      gen_random_uuid(), $1, $2, $3, $4, NOW(), true, $5, $6, $7, $8
    )
    RETURNING id, name, email, role, created_at,
              address_street AS street,
              address_city AS city,
              address_state AS state,
              address_zip AS zip
  `;

  const values = [
    name,
    email,
    passwordHash,
    role,
    address?.street || null,
    address?.city || null,
    address?.state || null,
    address?.zip || null
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
    `SELECT id, name, email, role, created_at,
            address_street AS street,
            address_city AS city,
            address_state AS state,
            address_zip AS zip
     FROM users
     WHERE active = true`
  );
  return result.rows;
};

// Retorna usuário por ID
const findById = async (id) => {
  const result = await db.query(
    `SELECT id, name, email, role, created_at,
            address_street AS street,
            address_city AS city,
            address_state AS state,
            address_zip AS zip
     FROM users
     WHERE id = $1 AND active = true`,
    [id]
  );
  return result.rows[0];
};

// Atualiza nome, e-mail e endereço
const update = async (id, { name, email, address }) => {
  const result = await db.query(
    `UPDATE users
     SET name = $1,
         email = $2,
         address_street = $3,
         address_city = $4,
         address_state = $5,
         address_zip = $6
     WHERE id = $7
     RETURNING id, name, email, role, created_at,
               address_street AS street,
               address_city AS city,
               address_state AS state,
               address_zip AS zip`,
    [
      name,
      email,
      address?.street || null,
      address?.city || null,
      address?.state || null,
      address?.zip || null,
      id
    ]
  );
  return result.rows[0];
};

// Atualiza senha
const updatePassword = async (id, passwordHash) => {
  await db.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, id]
  );
};

// Desativa usuário
const deactivate = async (id) => {
  await db.query(
    'UPDATE users SET active = false WHERE id = $1',
    [id]
  );
};

module.exports = {
  createUser,
  findByEmail,
  getAllUsers,
  findById,
  update,
  updatePassword,
  deactivate,
};