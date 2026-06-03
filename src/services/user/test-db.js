const pool = require('./src/db/connection.js'); // caminho correto

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexão OK! Horário do banco:', res.rows[0].now);
    await pool.end();
  } catch (err) {
    console.error('❌ Erro na conexão:', err);
  }
})();