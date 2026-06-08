// server.js

require('dotenv').config();
const app = require('./app');
const ensureSchema = require('./db/ensureSchema');

const PORT = process.env.PORT || 8080;

// Garante o schema antes de subir o servidor; sobe mesmo se falhar (loga o erro).
ensureSchema()
  .catch((err) => console.error('❌ Falha ao garantir schema:', err))
  .finally(() => {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  });
