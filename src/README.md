# 🛒 E-Commerce Escalável

Plataforma de e-commerce desenvolvida como projeto acadêmico da disciplina de **Sistemas Distribuídos**, utilizando Arquitetura Orientada a Serviços (SOA).

---

## ⚙️ Pré-requisitos

Você precisa ter instalado apenas:

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com)

---

## 🚀 Como rodar

### 1. Clone o repositório

```bash
git clone https://github.com/seu-grupo/ecommerce-soa
cd ecommerce-soa/src
```

### 2. Crie o arquivo de variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `src/`:

```env
POSTGRES_USER=disponivel no grupo do whats
POSTGRES_PASSWORD=
POSTGRES_DB=
JWT_SECRET=chave_super_secreta_minimo_32_caracteres_aqui
ASPNETCORE_ENVIRONMENT=Development
```

> ⚠️ Nunca suba o `.env` para o repositório. Ele já está no `.gitignore`.

### 3. Suba os serviços

```bash
docker compose up
```

Na primeira execução o Docker vai baixar as imagens e compilar os serviços — isso pode levar alguns minutos. Das próximas vezes será muito mais rápido.

---

## 🧪 URLs após subir

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8080 |
| UsersAPI | http://localhost:5001 |
| CatalogAPI | http://localhost:5002 |
| StockAPI | http://localhost:5003 |
| OrderAPI | http://localhost:5004 |
| PaymentAPI | http://localhost:5005 |
| RabbitMQ (painel) | http://localhost:15672 |

**Credenciais RabbitMQ:** `guest` / `guest`

---

## 🏗️ Arquitetura

```
                    ┌─────────────┐
                    │   Frontend  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐     ┌──────▼──────┐    ┌─────▼──────┐
  │ UsersAPI  │     │ CatalogAPI  │    │  StockAPI  │
  └───────────┘     └─────────────┘    └────────────┘
                           │
                    ┌──────▼──────┐
                    │  OrderAPI   │
                    └──────┬──────┘
                           │
             ┌─────────────┴─────────────┐
             │                           │
      ┌──────▼──────┐             ┌──────▼──────┐
      │ PaymentAPI  │             │  RabbitMQ   │
      └─────────────┘             └──────┬──────┘
                                         │
                                  ┌──────▼──────┐
                                  │Notification │
                                  │   Worker    │
                                  └─────────────┘

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    PostgreSQL
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🛠️ Comandos úteis

```bash
# Subir em segundo plano (libera o terminal)
docker compose up -d

# Ver logs de um serviço específico
docker compose logs usersapi
docker compose logs -f usersapi   # tempo real

# Parar tudo
docker compose down

# Parar e resetar o banco de dados
docker compose down -v

# Rebuild após mudanças no código
docker compose up --build
```

---

## 📁 Estrutura de pastas

```
src/
├── .env                    ← variáveis de ambiente (não subir no git)
├── docker-compose.yml      ← orquestração de todos os serviços
├── db/
│   └── init.sql            ← criação dos schemas do banco
├── gateway/
│   └── nginx.conf          ← configuração do API Gateway
├── frontend/               ← interface web
└── services/
    ├── user/               ← UsersAPI
    ├── catalog/            ← CatalogAPI
    ├── stock/              ← StockAPI
    ├── order/              ← OrderAPI
    ├── payment/            ← PaymentAPI
    └── notification/       ← NotificationWorker
```