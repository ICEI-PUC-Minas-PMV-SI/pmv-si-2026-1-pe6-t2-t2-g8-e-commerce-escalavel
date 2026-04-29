import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // Lê variáveis de ambiente a partir de src/.env (pasta raiz compartilhada)
  envDir: path.resolve(__dirname, '../../'),
  server: {
    port: 3000,
  },
})
