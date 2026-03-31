// app.js;

const express = require('express');
const app = express();

app.use(express.json());

// Importa rotas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Usa rotas
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// 🔹 Corrigido: rota estava com './test-db' (bug)
app.get('/test-db', async (req, res) => {
  const db = require('./db/connection');
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ message: 'Conexão bem-sucedida!', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: 'Erro ao conectar no banco' });
  }
});

// 🔥 Middleware global de erro (SEMPRE no final)
const errorMiddleware = require('./middlewares/errorMiddleware');
app.use(errorMiddleware);

module.exports = app;