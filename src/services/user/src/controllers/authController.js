// src/controllers/authController.js
const authService = require('../services/authService');

// Função para padronizar erros
const errorHandler = (err, res) => {
  let status = 400;
  let message = err.message || 'Erro desconhecido';

  switch (err.message) {
    case 'EMAIL_ALREADY_EXISTS':
      message = 'E-mail já cadastrado';
      status = 409;
      break;
    case 'INVALID_CREDENTIALS':
      message = 'E-mail ou senha inválidos';
      status = 401;
      break;
    case 'WEAK_PASSWORD':
      message = 'Senha muito fraca. Use ao menos 8 caracteres';
      status = 400;
      break;
    case 'INVALID_EMAIL':
      message = 'E-mail inválido';
      status = 400;
      break;
    case 'USER_INACTIVE':
      message = 'Usuário inativo';
      status = 403;
      break;
  }

  return res.status(status).json({ status: 'fail', message });
};

// Validação de e-mail
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validação de endereço (opcional)
const validateAddress = (address) => {
  if (!address) return true;

  const { street, city, state, zip } = address;

  // Se qualquer campo vier, todos devem ser string (mínimo básico)
  if (
    (street && typeof street !== 'string') ||
    (city && typeof city !== 'string') ||
    (state && typeof state !== 'string') ||
    (zip && typeof zip !== 'string')
  ) {
    return false;
  }

  return true;
};

// Registro de usuário
const register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // 🔹 validações
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres',
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'E-mail inválido',
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Senha deve ter no mínimo 8 caracteres',
      });
    }

    if (!validateAddress(address)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Endereço inválido',
      });
    }

    const result = await authService.register({
      name,
      email,
      password,
      address,
    });

    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    errorHandler(err, res);
  }
};

// Login de usuário
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 validações
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'E-mail inválido',
      });
    }

    if (!password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Senha é obrigatória',
      });
    }

    const result = await authService.login({ email, password });

    res.json({ status: 'success', data: result });
  } catch (err) {
    errorHandler(err, res);
  }
};

module.exports = {
  register,
  login,
};