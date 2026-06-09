// app.js;

const express = require('express');
const app = express();

// CORS é tratado de forma centralizada pelo gateway (nginx). Não setar aqui:
// o gateway usa add_header, que ACRESCENTA ao header do upstream, gerando
// dois Access-Control-Allow-Origin na resposta ("*, http://origin") e o
// browser rejeita com "Failed to fetch" mesmo em 200/201.

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