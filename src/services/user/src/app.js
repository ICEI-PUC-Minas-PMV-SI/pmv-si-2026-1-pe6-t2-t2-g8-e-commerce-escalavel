// app.js;

const express = require('express');
const app = express();

// CORS — permite chamadas do frontend web e mobile (Expo)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

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