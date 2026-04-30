// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 🔐 Middleware de autenticação (JWT)
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // Verifica se header existe
    if (!authHeader) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token não fornecido',
      });
    }

    // Espera formato: Bearer <token>
    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token mal formatado',
      });
    }

    const token = parts[1];

    // Verifica token
    const secret = process.env.JWT_SECRET;
    const payload = jwt.verify(token, secret);

    // Injeta usuário na request
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      status: 'fail',
      message: 'Token inválido ou expirado',
    });
  }
};

// 🔒 Middleware de autorização por role
const authorize = (roles = []) => {
  // Permite string ou array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // Precisa estar autenticado
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Não autenticado',
      });
    }

    // Verifica permissão
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Acesso negado',
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};