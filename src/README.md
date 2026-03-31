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


---

# UserService

Responsável por tudo que envolve identidade no sistema. É o único serviço que conhece as credenciais dos usuários e o único autorizado a emitir tokens JWT. Todos os demais serviços confiam na identidade que este serviço válida.

## Responsabilidades:

- Cadastrar novos usuários com validação de e-mail único e força de senha mínima.
- Autenticar usuários comparando a senha com o hash BCrypt armazenado.
- Gerar e assinar tokens JWT contendo userId, email, role e tempo de expiração.
- Permitir consulta e atualização de dados de perfil.
- Gerenciar dois níveis de acesso: customer e admin.

## Schema do banco (schema: users):

```
users
├── id            UUID (PK)
├── name          VARCHAR
├── email         VARCHAR (único)
├── password_hash VARCHAR
├── role          ENUM (customer | admin)
├── created_at    TIMESTAMP
└── active        BOOLEAN
```

## Endpoints

| Método | Rota | Descrição | Auth |
|------|------|------|------|
| POST | /auth/register | Cadastra usuário, retorna JWT | Não |
| POST | /auth/login | Autentica, retorna JWT | Não |
| GET | /users/{id} | Retorna dados do perfil | Sim |
| PUT | /users/{id} | Atualiza nome, e-mail, endereço | Sim |
| PUT | /users/{id}/password | Troca a senha | Sim |
| DELETE | /users/{id} | Desativa a conta do usuário | Sim |

---

# CatalogService

Responsável por todos os dados descritivos dos produtos disponíveis na loja. Não tem conhecimento sobre disponibilidade de estoque — responde apenas perguntas sobre o que o produto é, como é descrito e qual seu preço.

## Responsabilidades:

- Manter o cadastro de produtos com nome, descrição, preço e imagem.
- Organizar produtos em categorias hierárquicas.
- Permitir busca e filtragem por nome, categoria e faixa de preço.
- Permitir que administradores cadastrem, editem e removam produtos e categorias.

## Endpoints:

| Método | Rota | Descrição | Auth |
|------|------|------|------|
| GET | /products | Lista produtos com filtros opcionais | Não |
| GET | /products/{id} | Detalhe de um produto | Não |
| POST | /products | Cadastra novo produto | Admin |
| PUT | /products/{id} | Atualiza produto existente | Admin |
| DELETE | /products/{id} | Remove produto (soft delete) | Admin |
| GET | /categories | Lista todas as categorias | Não |
| POST | /categories | Cadastra nova categoria | Admin |

## Schema do banco (schema: catalog):

```
products
├── id          UUID (PK)
├── name        VARCHAR
├── description TEXT
├── price       DECIMAL
├── category_id UUID (FK)
├── image_url   VARCHAR
├── active      BOOLEAN
└── created_at  TIMESTAMP

categories
├── id   UUID (PK)
└── name VARCHAR
```

---

# StockService

Guardião da quantidade disponível de cada produto. Trabalha com o conceito de reserva temporária: ao iniciar um pedido, unidades são reservadas mas não baixadas definitivamente — a baixa só ocorre após confirmação de pagamento, garantindo consistência transacional.

## Responsabilidades:

- Informar a quantidade disponível de qualquer produto.
- Reservar unidades quando um pedido é iniciado, prevenindo venda duplicada.
- Liberar reservas em caso de cancelamento ou falha no pagamento.
- Confirmar a baixa definitiva de estoque após pagamento aprovado.
- Registrar o histórico completo de movimentações para auditoria.

## Endpoints:

| Método | Rota | Descrição | Auth |
|------|------|------|------|
| GET | /stock/{productId} | Quantidade disponível | Não |
| POST | /stock | Define estoque inicial (productId gerado pelo banco) | Admin |
| PUT | /stock/{productId}/reserve | Reserva unidades (pedido) | Sim |
| PUT | /stock/{productId}/release | Libera reserva (cancelamento) | Sim |
| PUT | /stock/{productId}/confirm | Baixa definitiva (pós pagto.) | Sim |
| GET | /stock/{productId}/history | Histórico de movimentações | Admin |

## Schema do banco (schema: stock):

```
stock_items
├── id                 UUID (PK)
├── product_id         UUID (único)
├── quantity_available INTEGER
└── quantity_reserved  INTEGER

stock_movements
├── id         UUID (PK)
├── product_id UUID (FK)
├── order_id   UUID
├── type       ENUM (reserve | release | confirm | restock)
├── quantity   INTEGER
└── created_at TIMESTAMP
```

---

# OrderService

É o serviço central e orquestrador do sistema. Coordena o fluxo de compra chamando StockService, PaymentService e publicando eventos no RabbitMQ para o NotificationService. Mantém o ciclo de vida completo dos pedidos.

## Responsabilidades:

- Criar pedidos a partir dos itens enviados pelo frontend.
- Orquestrar o fluxo: verificar estoque, processar pagamento, confirmar ou cancelar.
- Manter o histórico de pedidos e seus status ao longo do tempo.
- Publicar eventos no RabbitMQ para notificação assíncrona do usuário.
- Permitir cancelamento de pedidos ainda pendentes.

## Endpoints:

| Método | Rota | Descrição | Auth |
|------|------|------|------|
| POST | /orders | Cria novo pedido | Sim |
| GET | /orders/{id} | Detalhe do pedido | Sim |
| GET | /orders/user/{userId} | Pedidos do usuário autenticado | Sim |
| PUT | /orders/{id}/cancel | Cancela pedido pendente | Sim |
| GET | /orders | Lista todos os pedidos | Admin |

## Schema do banco (schema: orders):

```
orders
├── id           UUID (PK)
├── user_id      UUID
├── status       ENUM (draft|pending|confirmed|cancelled|failed)
├── total_amount DECIMAL
└── created_at   TIMESTAMP

order_items
├── id           UUID (PK)
├── order_id     UUID (FK)
├── product_id   UUID
├── product_name VARCHAR
├── unit_price   DECIMAL
└── quantity     INTEGER
```

## Fluxo interno de criação de pedido:

1. Cria pedido com status 'draft'
2. Para cada item: chama StockService → reserva estoque
3. Se estoque insuficiente: cancela tudo, retorna erro 422
4. Muda status para 'pending'
5. Chama PaymentService
6a. Aprovado: status 'confirmed' + StockService/confirm + publica ORDER_CONFIRMED
6b. Recusado: status 'failed'  + StockService/release  + publica PAYMENT_REFUSED

---

# PaymentService

Responsável por processar transações financeiras. No contexto deste projeto, simula a integração com um gateway de pagamento externo, retornando o resultado da transação sem comunicação real com operadoras de pagamento.

## Responsabilidades:

- Receber solicitações de pagamento com valor e identificação do pedido.
- Simular o processamento e retornar o status da transação.
- Registrar todas as transações com seu resultado para histórico e auditoria.
- Permitir solicitação de estorno por administradores.

## Endpoints:

| Método | Rota | Descrição | Auth |
|------|------|------|------|
| POST | /payments | Processa pagamento de um pedido | Sim |
| GET | /payments/{orderId} | Consulta status do pagamento | Sim |
| POST | /payments/{id}/refund | Solicita estorno | Admin |

## Schema do banco (schema: payments):

```
payments
├── id             UUID (PK)
├── order_id       UUID (único)
├── amount         DECIMAL
├── status         ENUM (pending | approved | refused | refunded)
├── transaction_id VARCHAR
└── created_at     TIMESTAMP
```

---

# NotificationService (Worker)

Diferentemente dos demais serviços, o NotificationService não é uma API REST — é um worker assíncrono que fica em execução contínua escutando filas do RabbitMQ. Ao receber um evento, monta e envia a notificação adequada ao usuário sem bloquear nenhum outro serviço.

## Responsabilidades:

- Escutar continuamente as filas do RabbitMQ aguardando eventos do OrderService.
- Identificar o tipo de evento e montar a mensagem correspondente.
- Enviar notificação por e-mail (via SendGrid ou simulado) ao usuário afetado.
- Registrar o histórico de notificações enviadas, incluindo falhas.
- Tentar reenvio automático em caso de falha (até 3 tentativas).

## Eventos consumidos da fila RabbitMQ:

| Evento | Publicado por | Ação do NotificationService |
|------|------|------|
| ORDER_CONFIRMED | OrderService | Envia e-mail: pedido confirmado com resumo dos itens |
| PAYMENT_REFUSED | OrderService | Envia e-mail: falha no pagamento, sugere nova tentativa |
| ORDER_CANCELLED | OrderService | Envia e-mail: pedido cancelado com motivo |

## Schema do banco (schema: notifications):

```
notifications
├── id         UUID (PK)
├── user_id    UUID
├── order_id   UUID
├── type       VARCHAR (ORDER_CONFIRMED | PAYMENT_REFUSED | ORDER_CANCELLED)
├── message    TEXT
├── status     ENUM (sent | failed)
└── sent_at    TIMESTAMP
```

---

# Diagrama de Comunicação entre Serviços

O único serviço que chama outros serviços diretamente é o OrderService, que age como orquestrador. Todos os demais são independentes e não se conhecem entre si.

```
Frontend (React)
  └─► API Gateway (Nginx)
        ├─► UserService    ← login, cadastro, perfil
        ├─► CatalogService ← listagem e busca de produtos
        └─► OrderService   ← criação e consulta de pedidos
              ├─► StockService    (reserva / libera / confirma estoque)
              ├─► PaymentService  (processa transação)
              └─► RabbitMQ        (publica evento)
                      └─► NotificationService (envia e-mail)
```

---oblig