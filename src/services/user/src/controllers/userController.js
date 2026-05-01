// src/controllers/userController.js
const userRepository = require('../repositories/userRepository');
const { hashPassword } = require('../utils/password');
const { sanitizeUser, isValidEmail, isValidCPF, isValidPhone, validateAddress } = require('../utils/userUtils');

// Retorna todos os usuários ativos
const getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.json({ status: 'success', data: users.map(sanitizeUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Erro ao listar usuários' });
  }
};

// Retorna TODOS os usuários (ativos + inativos) — admin
const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await userRepository.getAllUsersAdmin();
    res.json({ status: 'success', data: users.map(sanitizeUser) });
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

    res.json({
      status: 'success',
      data: sanitizeUser(user),
    }); 


  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Erro ao buscar usuário' });
  }
};

// Atualiza dados do usuário
const updateUser = async (req, res) => {
  try {
    let { name, email, cpf, phone, address } = req.body;

    // 🔹 validações
    if (name && name.trim().length < 2) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nome deve ter pelo menos 2 caracteres',
      });
    }

    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({
          status: 'fail',
          message: 'E-mail inválido',
        });
      }
      email = email.toLowerCase(); // normaliza
    }

    if (cpf && !isValidCPF(cpf)) {
      return res.status(400).json({
        status: 'fail',
        message: 'CPF inválido',
      });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Telefone inválido',
      });
    }

    if (!validateAddress(address)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Endereço inválido',
      });
    }

    // 🔹 monta objeto apenas com campos definidos
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (phone !== undefined) updateData.phone = phone;

    if (address !== undefined) {
      if (address.street !== undefined) updateData.address_street = address.street;
      if (address.city !== undefined) updateData.address_city = address.city;
      if (address.state !== undefined) updateData.address_state = address.state;
      if (address.zip !== undefined) updateData.address_zip = address.zip;
    }

    // 🔹 evita update vazio
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nenhum dado válido para atualização',
      });
    }

    const updatedUser = await userRepository.update(req.params.id, updateData);

    res.json({
      status: 'success',
      data: sanitizeUser(updatedUser),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'fail',
      message: 'Erro ao atualizar usuário',
    });
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

// Desativa usuário (soft delete)
const deleteUser = async (req, res) => {
  try {
    await userRepository.deactivate(req.params.id);
    res.json({ status: 'success', message: 'Usuário desativado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Erro ao desativar usuário' });
  }
};

// Reativa usuário — admin
const reactivateUser = async (req, res) => {
  try {
    await userRepository.reactivate(req.params.id);
    res.json({ status: 'success', message: 'Usuário reativado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Erro ao reativar usuário' });
  }
};

// Exclusão definitiva — apenas admin
const hardDeleteUser = async (req, res) => {
  try {
    await userRepository.hardDelete(req.params.id);
    res.json({ status: 'success', message: 'Usuário excluído permanentemente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Erro ao excluir usuário' });
  }
};

module.exports = {
  getAllUsers,
  getAllUsersAdmin,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser,
  reactivateUser,
  hardDeleteUser,
};