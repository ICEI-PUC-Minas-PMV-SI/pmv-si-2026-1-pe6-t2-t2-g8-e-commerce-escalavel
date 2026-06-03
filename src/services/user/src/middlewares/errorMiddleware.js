// src/middlewares/errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  let status = err.status || 500;
  let message = err.message || 'Erro interno do servidor';

  // Tratamento de erros conhecidos
  switch (err.message) {
    case 'EMAIL_ALREADY_EXISTS':
      status = 409;
      message = 'E-mail já cadastrado';
      break;
    case 'INVALID_CREDENTIALS':
      status = 401;
      message = 'E-mail ou senha inválidos';
      break;
    case 'USER_INACTIVE':
      status = 403;
      message = 'Usuário inativo';
      break;
  }

  res.status(status).json({
    status: 'fail',
    message,
  });
};

module.exports = errorMiddleware;