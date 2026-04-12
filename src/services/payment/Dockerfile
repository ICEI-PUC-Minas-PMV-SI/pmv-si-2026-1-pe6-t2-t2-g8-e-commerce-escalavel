# Usa a imagem oficial do Node.js levinha
FROM node:20-slim

# Cria o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências primeiro (ajuda no cache do Docker)
COPY package*.json ./

# Instala as dependências (o express)
RUN npm install

# Copia o resto do código (o server.js)
COPY . .

# Expõe a porta que a aplicação vai rodar
EXPOSE 8080

# Comando para iniciar a API
CMD ["node", "server.js"]
