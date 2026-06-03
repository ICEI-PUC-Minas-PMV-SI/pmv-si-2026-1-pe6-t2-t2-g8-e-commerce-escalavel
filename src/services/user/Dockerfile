FROM node:20-slim
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY src ./src

EXPOSE 8080
CMD ["node", "src/server.js"]