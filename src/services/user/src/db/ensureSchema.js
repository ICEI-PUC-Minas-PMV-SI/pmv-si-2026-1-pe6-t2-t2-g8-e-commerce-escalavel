// src/db/ensureSchema.js
//
// Garante a tabela `users` na subida do serviço.
// O banco é compartilhado entre serviços e o init.sql só roda na PRIMEIRA
// inicialização do Postgres (volume vazio). Em bancos já existentes a tabela
// nunca era criada. Este passo é idempotente (CREATE TABLE IF NOT EXISTS) e
// roda a cada boot, independente do estado do volume.

const db = require('./connection');

const DDL = `
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    email           TEXT        NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    role            TEXT        NOT NULL DEFAULT 'customer',
    cpf             TEXT,
    phone           TEXT,
    address_street  TEXT,
    address_city    TEXT,
    address_state   TEXT,
    address_zip     TEXT,
    active          BOOLEAN     NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

async function ensureSchema() {
  await db.query(DDL);
  console.log('✅ Schema de usuários garantido.');
}

module.exports = ensureSchema;
