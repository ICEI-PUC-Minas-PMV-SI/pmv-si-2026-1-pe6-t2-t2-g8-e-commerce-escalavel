// src/controllers/userController.js
const userRepository = require('../repositories/userRepository');
const { hashPassword } = require('../utils/password');

// Validação de e-mail
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validação de endereço
const validateAddress = (address) => {
  if (!address) return true;

  const { street, city, state, zip } = address;

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

// Retorna todos os usuários ativos
const getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.json({ status: 'success', data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Erro ao listar usuários' });
  }
};

// Retorna usuário por ID
const getUserById = async (req, res) => {
  try {
    const user = await userRepository.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuário não encontrado',
      });
    }

    res.json({ status: 'success', data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Erro ao buscar usuário' });
  }
};

// Atualiza dados do usuário
const updateUser = async (req, res) => {
  try {
    const { name, email, address } = req.body;

    // 🔹 validações
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nome deve ter pelo menos 2 caracteres',
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'E-mail inválido',
      });
    }

    if (!validateAddress(address)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Endereço inválido',
      });
    }

    const updatedUser = await userRepository.update(req.params.id, {
      name,
      email,
      address,
    });

    res.json({ status: 'success', data: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Erro ao atualizar usuário' });
  }
};

// Atualiza senha
const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;

    // 🔹 validação
    if (!password || password.length < 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Senha deve ter no mínimo 8 caracteres',
      });
    }

    const passwordHash = await hashPassword(password);

    await userRepository.updatePassword(req.params.id, passwordHash);

    res.json({
      status: 'success',
      message: 'Senha atualizada com sucesso',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Erro ao atualizar senha' });
  }
};

// Desativa usuário
const deleteUser = async (req, res) => {
  try {
    await userRepository.deactivate(req.params.id);

    res.json({
      status: 'success',
      message: 'Usuário desativado com sucesso',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Erro ao desativar usuário' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
};