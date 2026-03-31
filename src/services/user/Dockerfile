FROM node:20

WORKDIR /usr/src/app

# Copia package.json e package-lock.json (se existir)
COPY package.json package-lock.json* ./

# Instala dependências
RUN npm install

# Copia todo o restante do código
COPY . .

EXPOSE 5001
CMD ["node", "src/server.js"]