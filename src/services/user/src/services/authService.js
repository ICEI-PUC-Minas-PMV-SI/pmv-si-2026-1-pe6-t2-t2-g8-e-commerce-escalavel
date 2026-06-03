// src/services/authService.js
const userRepository = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

// Regex simples para validar e-mail
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const register = async ({ name, email, password, cpf, phone, address }) => {
  // valida e-mail
  if (!validateEmail(email)) {
    throw new Error('INVALID_EMAIL');
  }

  // verifica senha mínima
  if (!password || password.length < 8) {
    throw new Error('WEAK_PASSWORD');
  }

  // verifica se já existe
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  // hash da senha
  const passwordHash = await hashPassword(password);

  // cria usuário com endereço opcional
  const user = await userRepository.createUser({
    name,
    email,
    passwordHash,
    role: 'customer',
    cpf: cpf || null,
    phone: phone || null,
    address, // { street, city, state, zip }
  });

  // gera token
  const token = generateToken(user);

  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isValid = await comparePassword(password, user.password_hash);

  if (!isValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // verifica se usuário está ativo
  if (!user.active) {
    throw new Error('USER_INACTIVE');
  }

  const token = generateToken(user);

  return { user, token };
};

module.exports = {
  register,
  login,
};