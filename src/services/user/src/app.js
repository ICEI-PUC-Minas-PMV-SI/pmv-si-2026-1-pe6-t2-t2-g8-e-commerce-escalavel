// app.js;

const express = require('express');
const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'usersapi' });
});

// Importa rotas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Usa rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// 🔥 Middleware global de erro (SEMPRE no final)
const errorMiddleware = require('./middlewares/errorMiddleware');
app.use(errorMiddleware);

module.exports = app;