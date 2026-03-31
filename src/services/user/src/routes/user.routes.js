// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Lista todos usuários → apenas admin
router.get(
  '/',
  authenticate,
  authorize('admin'),
  userController.getAllUsers
);

// Rota por id → o próprio usuário ou admin
router.get(
  '/:id',
  authenticate,
  (req, res, next) => {
    if (req.user.role === 'admin' || req.user.id === req.params.id) {
      return next();
    }
    return res.status(403).json({ status: 'fail', message: 'Acesso não autorizado' });
  },
  userController.getUserById
);

// Atualiza dados do usuário → apenas o próprio usuário
router.put(
  '/:id',
  authenticate,
  (req, res, next) => {
    if (req.user.id === req.params.id) return next();
    return res.status(403).json({ status: 'fail', message: 'Acesso não autorizado' });
  },
  userController.updateUser
);

// Atualiza senha → apenas o próprio usuário
router.put(
  '/:id/password',
  authenticate,
  (req, res, next) => {
    if (req.user.id === req.params.id) return next();
    return res.status(403).json({ status: 'fail', message: 'Acesso não autorizado' });
  },
  userController.updatePassword
);

// Deleta/desativa usuário → o próprio usuário ou admin
router.delete(
  '/:id',
  authenticate,
  (req, res, next) => {
    if (req.user.role === 'admin' || req.user.id === req.params.id) return next();
    return res.status(403).json({ status: 'fail', message: 'Acesso não autorizado' });
  },
  userController.deleteUser
);

module.exports = router;