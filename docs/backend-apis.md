# Back-End APIs

## StockAPI

### Objetivos da API
A StockAPI e responsavel por controlar o estoque por produto usando reserva temporaria para suportar o fluxo de pedidos.

Objetivos principais:
- Criar item de estoque inicial para um produto.
- Reabastecer quantidade disponivel.
- Reservar estoque para um pedido.
- Liberar reserva em caso de cancelamento/falha.
- Confirmar baixa definitiva apos aprovacao de pagamento.
- Expor historico de movimentacoes para auditoria.

### Modelagem da Aplicacao
Entidades principais (schema `stock`):
- `stock_items`: estado atual do estoque por produto.
- `stock_reservations`: reserva acumulada por par `productId + orderId`.
- `stock_movements`: trilha de auditoria de operacoes (`restock`, `reserve`, `release`, `confirm`).

Regras de negocio centrais:
- Nao permite reservar acima de `quantityAvailable`.
- Nao permite liberar/confirmar acima de `quantityReserved` para o pedido.
- `salePrice` deve ser maior ou igual a `costPrice`.

### Tecnologias Utilizadas
- ASP.NET Core (.NET 10)
- Entity Framework Core
- PostgreSQL (Npgsql)
- Docker / Docker Compose
- Nginx Gateway

### Base URLs
- Direto no servico: `http://localhost:5003`
- Via gateway: `http://localhost:7000/api/stock`

### API Endpoints

#### GET /health
Objetivo: healthcheck da StockAPI.

- URL direta: `/health`
- URL gateway: `/health`
- Body: nao possui

Respostas:
- `200 OK`

Exemplo de resposta:
```json
{
  "status": "ok",
  "service": "stockapi"
}
```

#### GET /stock
Objetivo: listar todos os itens de estoque.

- URL direta: `/stock`
- URL gateway: `/`
- Body: nao possui

Respostas:
- `200 OK`

#### GET /stock/{productId}
Objetivo: consultar um item de estoque por `productId`.

- URL direta: `/stock/{productId}`
- URL gateway: `/{productId}`
- Parametros de rota:
  - `productId` (guid)

Respostas:
- `200 OK`
- `404 Not Found`

#### POST /stock
Objetivo: criar item inicial de estoque.

- URL direta: `/stock`
- URL gateway: `/`
- Body (`CreateStockRequest`):
  - `name` (string, min 2, max 150)
  - `quantity` (int, >= 0)
  - `color` (string, min 1, max 50)
  - `model` (string, min 1, max 80)
  - `size` (string, min 1, max 30)
  - `costPrice` (decimal, >= 0)
  - `salePrice` (decimal, >= 0 e >= costPrice)

Respostas:
- `201 Created`
- `400 Bad Request`
- `409 Conflict`

#### PUT /stock/{productId}/restock
Objetivo: incrementar a quantidade disponivel.

- URL direta: `/stock/{productId}/restock`
- URL gateway: `/{productId}/restock`
- Parametros de rota:
  - `productId` (guid)
- Body (`RestockRequest`):
  - `quantity` (int, >= 1)

Respostas:
- `200 OK`
- `404 Not Found`
- `409 Conflict`

#### PUT /stock/{productId}/reserve/{orderId}
Objetivo: reservar estoque para um pedido.

- URL direta: `/stock/{productId}/reserve/{orderId}`
- URL gateway: `/{productId}/reserve/{orderId}`
- Parametros de rota:
  - `productId` (guid)
  - `orderId` (guid)
- Body (`ReserveRequest`):
  - `quantity` (int, >= 1)

Respostas:
- `200 OK`
- `400 Bad Request`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`

#### PUT /stock/{productId}/release/{orderId}
Objetivo: liberar reserva de um pedido.

- URL direta: `/stock/{productId}/release/{orderId}`
- URL gateway: `/{productId}/release/{orderId}`
- Parametros de rota:
  - `productId` (guid)
  - `orderId` (guid)
- Body (`ReleaseRequest`):
  - `quantity` (int, >= 1)

Respostas:
- `200 OK`
- `400 Bad Request`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`

#### PUT /stock/{productId}/confirm/{orderId}
Objetivo: confirmar baixa definitiva do estoque reservado.

- URL direta: `/stock/{productId}/confirm/{orderId}`
- URL gateway: `/{productId}/confirm/{orderId}`
- Parametros de rota:
  - `productId` (guid)
  - `orderId` (guid)
- Body (`ConfirmRequest`):
  - `quantity` (int, >= 1)

Respostas:
- `200 OK`
- `400 Bad Request`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`

#### GET /stock/{productId}/history
Objetivo: retornar historico de movimentacoes de um produto.

- URL direta: `/stock/{productId}/history`
- URL gateway: `/{productId}/history`
- Parametros de rota:
  - `productId` (guid)

Respostas:
- `200 OK`
- `404 Not Found`

Formato da resposta (`StockMovementResponse`):
- `id` (guid)
- `productId` (guid)
- `orderId` (guid|null)
- `type` (string: restock|reserve|release|confirm)
- `quantity` (int)
- `createdAt` (datetime UTC)

### Consideracoes de Seguranca
Estado atual:
- Nao ha `[Authorize]` nos controllers da StockAPI.
- Nao ha autenticacao/autorizacao aplicada no pipeline desta API.

Recomendacao:
- Aplicar JWT no gateway e na API antes de uso em producao.
- Definir politicas por endpoint (ex.: create/restock para admin).

### Implantacao
Servico em Docker Compose:
- `stockapi` expondo porta `5003` externa para `8080` interna.
- Gateway Nginx roteando `/api/stock/*` para `stockapi:8080`.

Comandos principais:
```bash
docker compose up --build -d
docker compose up -d --build stockapi gateway
```

### Testes
Fluxo recomendado de validacao funcional:
1. `POST /stock`
2. `PUT /stock/{productId}/restock`
3. `PUT /stock/{productId}/reserve/{orderId}`
4. `PUT /stock/{productId}/release/{orderId}`
5. `PUT /stock/{productId}/confirm/{orderId}`
6. `GET /stock/{productId}/history`

Cenarios de erro importantes:
- Duplicidade de nome no create (`409`).
- Reserva acima do disponivel (`422`).
- Release/confirm acima do reservado (`422`).
- Produto inexistente (`404`).

### Referencias
- `services/stock/StockAPI/Controllers/StockController.cs`
- `services/stock/StockAPI/Services/StockService.cs`
- `services/stock/StockAPI/DTOs`
- `services/stock/StockAPI/POSTMAN_API_REFERENCE.md`
- `gateway/nginx.conf`


# Back-End APIs

## CatalogAPI

### Objetivos da API
A CatalogAPI e responsavel por gerenciar o catalogo de produtos e categorias da plataforma de e-commerce.

Objetivos principais:
- Cadastrar e gerenciar categorias de produtos.
- Cadastrar, editar e remover produtos do catalogo.
- Listar produtos com filtros dinamicos por nome, categoria e faixa de preco.
- Expor detalhes completos de um produto incluindo sua categoria.

### Modelagem da Aplicacao
Entidades principais (schema `catalog`):
- `category`: categorias dos produtos (id, name, active).
- `product`: produtos do catalogo com relacionamento para category (id, name, description, price, url_img, active, category_id).

Regras de negocio centrais:
- Um produto deve estar associado a uma categoria existente.
- Ao buscar um produto, os dados completos da categoria sao retornados no response.
- Filtros de listagem sao todos opcionais — sem filtros retorna todos os produtos.

### Tecnologias Utilizadas
- Java 21 + Spring Boot 3.4.4
- Spring Data JPA + Hibernate
- PostgreSQL
- Docker / Docker Compose
- Nginx Gateway
- Springdoc / Swagger UI

### Base URLs
- Direto no servico: `http://localhost:5002`
- Via gateway: `http://localhost:7000/api/catalog`

---

### API Endpoints — Categorias

#### GET /categories
Objetivo: listar todas as categorias.

- URL direta: `/categories`
- URL gateway: `/api/catalog/categories`
- Body: nao possui

Respostas:
- `200 OK`

Exemplo de resposta:
```json
[
  {
    "id": "8b63f5a1-acca-43b9-a073-33eb85379a35",
    "name": "Camisetas",
    "active": true
  }
]
```

---

#### GET /categories/{id}
Objetivo: buscar uma categoria por id.

- URL direta: `/categories/{id}`
- URL gateway: `/api/catalog/categories/{id}`
- Parametros de rota:
  - `id` (uuid)

Respostas:
- `200 OK`
- `404 Not Found`

---

#### POST /categories
Objetivo: criar uma nova categoria.

- URL direta: `/categories`
- URL gateway: `/api/catalog/categories`
- Body (`CategoryRequestDTO`):
  - `name` (string)
  - `active` (boolean)

Respostas:
- `201 Created`
- `500 Internal Server Error`

Exemplo de body:
```json
{
  "name": "Camisetas",
  "active": true
}
```

---

#### PUT /categories/{id}
Objetivo: atualizar uma categoria existente.

- URL direta: `/categories/{id}`
- URL gateway: `/api/catalog/categories/{id}`
- Parametros de rota:
  - `id` (uuid)
- Body (`CategoryRequestDTO`):
  - `name` (string)
  - `active` (boolean)

Respostas:
- `200 OK`
- `404 Not Found`

---

#### DELETE /categories/{id}
Objetivo: remover uma categoria.

- URL direta: `/categories/{id}`
- URL gateway: `/api/catalog/categories/{id}`
- Parametros de rota:
  - `id` (uuid)
- Body: nao possui

Respostas:
- `204 No Content`
- `404 Not Found`

---

### API Endpoints — Produtos

#### GET /products
Objetivo: listar produtos com filtros opcionais.

- URL direta: `/products`
- URL gateway: `/api/catalog/products`
- Query params (todos opcionais):
  - `name` (string) — filtra por nome (busca parcial, case insensitive)
  - `categoryId` (uuid) — filtra por categoria
  - `minPrice` (decimal) — preco minimo
  - `maxPrice` (decimal) — preco maximo
- Body: nao possui

Respostas:
- `200 OK`

Exemplo de resposta:
```json
[
  {
    "id": "3b126cc8-d0c9-4e69-817b-c9208a4acda8",
    "name": "Camiseta Basica",
    "description": "Camiseta 100% algodao",
    "price": 49.90,
    "urlImg": "https://exemplo.com/img.jpg",
    "active": true,
    "category": {
      "id": "8b63f5a1-acca-43b9-a073-33eb85379a35",
      "name": "Camisetas",
      "active": true
    }
  }
]
```

---

#### GET /products/{id}
Objetivo: buscar um produto por id.

- URL direta: `/products/{id}`
- URL gateway: `/api/catalog/products/{id}`
- Parametros de rota:
  - `id` (uuid)

Respostas:
- `200 OK`
- `404 Not Found`

---

#### POST /products
Objetivo: criar um novo produto.

- URL direta: `/products`
- URL gateway: `/api/catalog/products`
- Body (`ProductRequestDTO`):
  - `name` (string)
  - `description` (string)
  - `price` (decimal)
  - `urlImg` (string)
  - `active` (boolean)
  - `categoryId` (uuid)

Respostas:
- `201 Created`
- `404 Not Found` — categoria nao encontrada

Exemplo de body:
```json
{
  "name": "Camiseta Basica",
  "description": "Camiseta 100% algodao",
  "price": 49.90,
  "urlImg": "https://exemplo.com/img.jpg",
  "active": true,
  "categoryId": "8b63f5a1-acca-43b9-a073-33eb85379a35"
}
```

---

#### PUT /products/{id}
Objetivo: atualizar um produto existente.

- URL direta: `/products/{id}`
- URL gateway: `/api/catalog/products/{id}`
- Parametros de rota:
  - `id` (uuid)
- Body (`ProductRequestDTO`):
  - `name` (string)
  - `description` (string)
  - `price` (decimal)
  - `urlImg` (string)
  - `active` (boolean)
  - `categoryId` (uuid)

Respostas:
- `200 OK`
- `404 Not Found`

---

#### DELETE /products/{id}
Objetivo: remover um produto.

- URL direta: `/products/{id}`
- URL gateway: `/api/catalog/products/{id}`
- Parametros de rota:
  - `id` (uuid)
- Body: nao possui

Respostas:
- `204 No Content`
- `404 Not Found`

---

### Tratamento de Erros

A CatalogAPI nao possui um `GlobalExceptionHandler` customizado. Excecoes (`RuntimeException`) lancadas pelos servicos sao tratadas pelo mecanismo padrao do Spring Boot, que retorna o formato de erro default:

```json
{
  "timestamp": "2026-04-08T19:11:09.000+00:00",
  "status": 500,
  "error": "Internal Server Error",
  "path": "/products/uuid-inexistente"
}
```

> **Nota:** Recursos nao encontrados retornam `500 Internal Server Error` (e nao `404`) porque as excecoes nao sao mapeadas para status HTTP especificos. Recomenda-se implementar um `@RestControllerAdvice` para retornar codigos HTTP adequados.

---

### Consideracoes de Seguranca
Estado atual:
- Nao ha autenticacao/autorizacao aplicada nos controllers da CatalogAPI.
- O gateway repassa o header `Authorization` para o servico quando presente.

Recomendacao:
- Aplicar validacao JWT no gateway e na API antes de uso em producao.
- Endpoints de criacao, edicao e remocao devem exigir perfil de administrador.

---

### Implantacao
Servico em Docker Compose:
- `catalogapi` expondo porta `5002` externa para `8080` interna.
- Gateway Nginx roteando `/api/catalog/*` para `catalogapi:8080`.
- Health check via `curl -f http://localhost:8080/health`.

Comandos principais:
```bash
docker compose build catalogapi
docker compose up catalogapi -d
docker compose up gateway -d
```

---

### Testes
Fluxo recomendado de validacao funcional:
1. `POST /categories` — criar uma categoria
2. `GET /categories` — listar categorias
3. `POST /products` — criar produto vinculado a categoria
4. `GET /products` — listar produtos sem filtros
5. `GET /products?name=camiseta&minPrice=20` — listar com filtros
6. `GET /products/{id}` — buscar produto por id
7. `PUT /products/{id}` — atualizar produto
8. `DELETE /products/{id}` — remover produto

Cenarios de erro importantes:
- Buscar produto inexistente (`404`).
- Criar produto com categoria inexistente (`404`).
- Atualizar produto inexistente (`404`).

---

### Referencias
- `services/catalog/Catalog API/src/main/java/com/ecommerce/catalog/controller/ProductController.java`
- `services/catalog/Catalog API/src/main/java/com/ecommerce/catalog/controller/CategoryController.java`
- `services/catalog/Catalog API/src/main/java/com/ecommerce/catalog/service/ProductService.java`
- `services/catalog/Catalog API/src/main/java/com/ecommerce/catalog/service/CategoryService.java`
- `services/catalog/Catalog API/src/main/java/com/ecommerce/catalog/dto`
- `gateway/nginx.conf`
- `http://localhost:5002/swagger-ui/index.html`


---
# Back-End APIs

## NotificationService

### Objetivos do Worker

O NotificationService e responsavel por processar eventos de pedidos e realizar o envio de notificacoes de forma assincrona dentro da arquitetura distribuida.

Objetivos principais:

* Consumir eventos de pedidos via RabbitMQ.
* Processar notificacoes de forma desacoplada.
* Simular envio de e-mails para clientes.
* Registrar notificacoes no banco de dados.

---

### Modelagem da Aplicacao

Entidades principais (schema `notifications`):

* `notifications`: registro das notificacoes processadas (id, message, sentAt).

Regras de negocio centrais:

* Cada mensagem recebida gera um registro de notificacao.
* O processamento e assincrono e nao depende de resposta imediata.
* Mensagens invalidas nao devem gerar persistencia no banco.

---

### Tecnologias Utilizadas

* .NET 8 (Worker Service)
* MassTransit
* RabbitMQ
* Entity Framework Core
* PostgreSQL (Npgsql)

---

### Arquitetura

O NotificationService nao expoe endpoints HTTP, funcionando como um Worker que consome mensagens da fila RabbitMQ.

Fluxo:

1. Um evento e publicado na fila `notifications`
2. O NotificationService consome a mensagem
3. Processa o evento
4. Salva no banco de dados
5. Exibe log no console

---

### Estrutura da Mensagem

Formato esperado:

```json
{
  "orderId": 1,
  "customerEmail": "string"
}
```

---

### Consideracoes de Seguranca

Estado atual:

* Nao ha autenticacao ou autorizacao aplicada.
* O servico consome mensagens diretamente da fila.

Recomendacao:

* Validar autenticacao no produtor (OrderAPI) e/ou gateway.
* Implementar validacao de integridade das mensagens.

---

### Implantacao

Servico em Docker Compose:

* `notificationworker` consumindo fila RabbitMQ `notifications`.
* Variaveis de ambiente: `ConnectionStrings__Default`, `RABBITMQ_URL`.

Dependencias:

* RabbitMQ ativo (`service_healthy`)
* Banco PostgreSQL ativo (`service_healthy`)

Comandos principais:

```bash
docker compose up --build notificationworker
docker compose logs notificationworker
```

---

### Testes

Fluxo recomendado de validacao funcional:

1. Publicar mensagem na fila RabbitMQ
2. Consumir mensagem pelo NotificationService
3. Verificar log no console
4. Validar registro no banco

---

### Casos de Teste

#### Caso 01 – Pedido Criado

Entrada:

```json
{
  "orderId": 1,
  "customerEmail": "teste@email.com"
}
```

Acao:
Publicar mensagem manualmente na fila `notifications` via interface do RabbitMQ.

Resultado esperado:

* Mensagem consumida com sucesso
* Registro salvo na tabela `notifications`
* Log exibido no console:

```
Email enviado para teste@email.com
```

---

#### Caso 02 – Multiplas mensagens

Entrada:
Envio de varias mensagens consecutivas na fila.

Resultado esperado:

* Todas as mensagens processadas
* Registros criados no banco
* Logs exibidos corretamente

---

#### Caso 03 – Payload invalido

Entrada:

```json
{
  "erro": true
}
```

Resultado esperado:

* Mensagem ignorada ou erro registrado no console
* Nenhum registro salvo no banco

---

### Consideracoes

Os testes foram realizados via publicacao manual de mensagens no RabbitMQ, simulando o fluxo de eventos do sistema distribuido.

---

### Referencias

* `services/notification/Program.cs`
* `services/notification/NotificationService.csproj`
* `services/notification/Dockerfile`
* `docker-compose.yml`


---
# Back-End APIs

## UserAPI

### Objetivos da API
A UserAPI e responsavel pelo gerenciamento de usuarios da plataforma, incluindo cadastro, autenticacao e controle de acesso.

Objetivos principais:
- Registrar novos usuarios com dados pessoais e endereco.
- Autenticar usuarios via JWT.
- Consultar, atualizar e desativar contas de usuario.
- Controlar acesso por perfil (admin e customer).

### Modelagem da Aplicacao
Entidades principais (schema `users`):
- `users`: dados do usuario (id, name, email, password_hash, role, address, active, created_at, updated_at).

Regras de negocio centrais:
- E-mail unico por usuario.
- Senha armazenada com BCrypt (10 rounds).
- Usuarios novos recebem role `customer`.
- DELETE realiza soft-delete (marca como inativo).

### Tecnologias Utilizadas
- Node.js 20 + Express 4.18
- PostgreSQL (pg driver)
- JSON Web Tokens (jsonwebtoken)
- BCrypt para hash de senhas
- Docker / Docker Compose
- Nginx Gateway

### Base URLs
- Direto no servico: `http://localhost:5001`
- Via gateway: `http://localhost:7000/api/auth` (rotas publicas) e `http://localhost:7000/api/users` (rotas protegidas)

### Autenticacao
- Header: `Authorization: Bearer <token>`
- Token JWT com payload: `{ sub, email, role }`
- Expiracao: 1 hora
- Assinatura: HS256 com `JWT_SECRET` (env var) — algoritmo padrao implicito da lib `jsonwebtoken`, nao definido explicitamente no codigo

---

### API Endpoints — Autenticacao

#### GET /health
Objetivo: healthcheck da UserAPI.

- URL direta: `/health`
- Body: nao possui

Respostas:
- `200 OK`

Exemplo de resposta:
```json
{
  "status": "ok",
  "service": "usersapi"
}
```

---

#### POST /auth/register
Objetivo: registrar um novo usuario.

- URL direta: `/auth/register`
- URL gateway: `/api/auth/register`
- Autenticacao: nao requer
- Body:
  - `name` (string, min 2 caracteres, obrigatorio)
  - `email` (string, formato valido, obrigatorio)
  - `password` (string, min 8 caracteres, obrigatorio)
  - `address` (objeto, opcional):
    - `street` (string)
    - `city` (string)
    - `state` (string)
    - `zip` (string)

Respostas:
- `201 Created` — `{ "status": "success", "data": { user, token } }`
- `400 Bad Request` — nome, email ou senha invalidos
- `409 Conflict` — e-mail ja cadastrado

Exemplo de body:
```json
{
  "name": "Joao Silva",
  "email": "joao@example.com",
  "password": "senhaSegura123",
  "address": {
    "street": "Rua das Flores, 123",
    "city": "Belo Horizonte",
    "state": "MG",
    "zip": "30130-000"
  }
}
```

---

#### POST /auth/login
Objetivo: autenticar usuario e obter token JWT.

- URL direta: `/auth/login`
- URL gateway: `/api/auth/login`
- Autenticacao: nao requer
- Body:
  - `email` (string, formato valido, obrigatorio)
  - `password` (string, obrigatorio)

Respostas:
- `200 OK` — `{ "status": "success", "data": { token, user } }`
- `400 Bad Request` — email invalido ou senha ausente
- `401 Unauthorized` — credenciais invalidas
- `403 Forbidden` — usuario inativo

---

### API Endpoints — Usuarios (todos requerem Bearer token)

#### GET /users
Objetivo: listar todos os usuarios ativos.

- URL direta: `/users/`
- URL gateway: `/api/users/`
- Autenticacao: Bearer token (somente admin)

Respostas:
- `200 OK` — `{ "status": "success", "data": [ users ] }`
- `401 Unauthorized` — token ausente ou invalido
- `403 Forbidden` — perfil insuficiente

---

#### GET /users/:id
Objetivo: buscar usuario por ID.

- URL direta: `/users/:id`
- URL gateway: `/api/users/:id`
- Autenticacao: Bearer token (proprio usuario ou admin)
- Parametros de rota:
  - `id` (string)

Respostas:
- `200 OK` — `{ "status": "success", "data": user }`
- `403 Forbidden` — acesso nao autorizado
- `404 Not Found` — usuario nao encontrado

---

#### PUT /users/:id
Objetivo: atualizar dados do usuario.

- URL direta: `/users/:id`
- URL gateway: `/api/users/:id`
- Autenticacao: Bearer token (somente proprio usuario)
- Parametros de rota:
  - `id` (string)
- Body (todos opcionais):
  - `name` (string, min 2 caracteres)
  - `email` (string, formato valido)
  - `address` (objeto com street, city, state, zip)

Respostas:
- `200 OK` — `{ "status": "success", "data": updatedUser }`
- `400 Bad Request` — dados invalidos
- `403 Forbidden` — acesso nao autorizado

---

#### PUT /users/:id/password
Objetivo: alterar senha do usuario.

- URL direta: `/users/:id/password`
- URL gateway: `/api/users/:id/password`
- Autenticacao: Bearer token (somente proprio usuario)
- Parametros de rota:
  - `id` (string)
- Body:
  - `password` (string, min 8 caracteres, obrigatorio)

Respostas:
- `200 OK` — `{ "status": "success", "message": "Senha atualizada com sucesso" }`
- `400 Bad Request` — senha fraca
- `403 Forbidden` — acesso nao autorizado

---

#### DELETE /users/:id
Objetivo: desativar conta de usuario (soft-delete).

- URL direta: `/users/:id`
- URL gateway: `/api/users/:id`
- Autenticacao: Bearer token (proprio usuario ou admin)
- Parametros de rota:
  - `id` (string)

Respostas:
- `200 OK` — `{ "status": "success", "message": "Usuario desativado com sucesso" }`
- `403 Forbidden` — acesso nao autorizado

---

### Consideracoes de Seguranca
Estado atual:
- Autenticacao JWT implementada em todas as rotas de usuario.
- Autorizacao por role (admin/customer) nos endpoints de listagem e exclusao.
- Senhas hasheadas com BCrypt (10 salt rounds).
- Validacao de entrada em todos os endpoints.

Recomendacao:
- Implementar rate limiting para rotas de login/register.
- Adicionar refresh tokens para renovacao de sessao.

---

### Implantacao
Servico em Docker Compose:
- `usersapi` expondo porta `5001` externa para `8080` interna.
- Gateway Nginx roteando `/api/auth/*` para `usersapi:8080/auth/` e `/api/users/*` para `usersapi:8080/users/`.

Comandos principais:
```bash
docker compose up --build usersapi
docker compose logs usersapi
```

---

### Testes
Fluxo recomendado de validacao funcional:
1. `POST /auth/register` — criar usuario
2. `POST /auth/login` — autenticar e obter token
3. `GET /users/:id` — buscar usuario com token
4. `PUT /users/:id` — atualizar dados
5. `PUT /users/:id/password` — alterar senha
6. `DELETE /users/:id` — desativar conta

Cenarios de erro importantes:
- Registro com e-mail duplicado (`409`).
- Login com credenciais invalidas (`401`).
- Acesso a outro usuario sem ser admin (`403`).
- Token expirado ou ausente (`401`).

---

### Referencias
- `services/user/src/controllers/authController.js`
- `services/user/src/controllers/userController.js`
- `services/user/src/routes/auth.routes.js`
- `services/user/src/routes/user.routes.js`
- `services/user/src/middlewares/authMiddleware.js`
- `gateway/nginx.conf`


---
# Back-End APIs

## OrderAPI

### Objetivos da API
A OrderAPI e responsavel por gerenciar os pedidos da plataforma de e-commerce.

Objetivos principais:
- Criar novos pedidos com itens.
- Listar pedidos (todos ou por usuario).
- Consultar detalhes de um pedido.
- Atualizar status de um pedido.
- Cancelar pedidos.

### Modelagem da Aplicacao
Entidades principais (schema `orders`):
- `orders`: pedido (id, customer_id, status).
- `order_items`: itens do pedido (product_id, quantity), colecao embutida no pedido.

Status possiveis: `CREATED`, `APPROVED`, `CANCELLED`.

> **Nota de implementacao:** O campo `status` e armazenado como `String` (sem enum). O endpoint `PATCH /orders/{id}/status` aceita qualquer valor de texto — nao ha validacao de valores permitidos. Apenas `CREATED` (na criacao) e `CANCELLED` (no cancelamento) sao atribuidos pelo codigo; `APPROVED` pode ser enviado via PATCH mas nao e utilizado internamente.

Regras de negocio centrais:
- Pedido criado sempre com status `CREATED`.
- Cancelamento altera status para `CANCELLED`.
- Pedido inexistente lanca excecao (`RuntimeException`), retornando `500 Internal Server Error` (sem `@ExceptionHandler` customizado).

### Tecnologias Utilizadas
- Java 17 + Spring Boot 4.0.3
- Spring Data JPA + Hibernate
- Spring AMQP (RabbitMQ) — dependencia configurada em `application.properties`, porem nao utilizada no codigo atual (nenhum `RabbitTemplate` ou `@RabbitListener` implementado)
- PostgreSQL
- Docker / Docker Compose
- Nginx Gateway
- Springdoc / Swagger UI
- Spring Boot Actuator

### Base URLs
- Direto no servico: `http://localhost:5004`
- Via gateway: `http://localhost:7000/api/orders`
- Swagger UI: `http://localhost:5004/swagger-ui.html`

---

### API Endpoints

#### GET /actuator/health
Objetivo: healthcheck da OrderAPI (Spring Boot Actuator).

- URL direta: `/actuator/health`
- URL gateway: `/api/orders/health`
- Body: nao possui

Respostas:
- `200 OK`

Exemplo de resposta:
```json
{
  "status": "UP"
}
```

---

#### POST /orders
Objetivo: criar um novo pedido.

- URL direta: `/orders`
- URL gateway: `/api/orders/`
- Autenticacao: nao requer (estado atual)
- Body (`OrderRequest`):
  - `customerId` (long, obrigatorio)
  - `items` (array, obrigatorio):
    - `productId` (long)
    - `quantity` (int)

Respostas:
- `200 OK`

Exemplo de body:
```json
{
  "customerId": 1,
  "items": [
    { "productId": 100, "quantity": 2 },
    { "productId": 200, "quantity": 1 }
  ]
}
```

Exemplo de resposta:
```json
{
  "id": 1,
  "customerId": 1,
  "items": [
    { "productId": 100, "quantity": 2 },
    { "productId": 200, "quantity": 1 }
  ],
  "status": "CREATED"
}
```

---

#### GET /orders
Objetivo: listar todos os pedidos.

- URL direta: `/orders`
- URL gateway: `/api/orders/`
- Body: nao possui

Respostas:
- `200 OK` — array de `OrderResponse`

---

#### GET /orders/{id}
Objetivo: buscar pedido por ID.

- URL direta: `/orders/{id}`
- URL gateway: `/api/orders/{id}`
- Parametros de rota:
  - `id` (long)

Respostas:
- `200 OK` — `OrderResponse`
- `500 Internal Server Error` — pedido nao encontrado

---

#### GET /orders/user/{userId}
Objetivo: listar pedidos de um usuario.

- URL direta: `/orders/user/{userId}`
- URL gateway: `/api/orders/user/{userId}`
- Parametros de rota:
  - `userId` (long)

Respostas:
- `200 OK` — array de `OrderResponse`

---

#### PATCH /orders/{id}/status
Objetivo: atualizar status de um pedido.

- URL direta: `/orders/{id}/status?status=APPROVED`
- URL gateway: `/api/orders/{id}/status?status=APPROVED`
- Parametros de rota:
  - `id` (long)
- Query params:
  - `status` (string, obrigatorio) — novo status (ex: `APPROVED`)

Respostas:
- `200 OK` — `OrderResponse` com status atualizado
- `500 Internal Server Error` — pedido nao encontrado

---

#### POST /orders/{id}/cancel
Objetivo: cancelar um pedido.

- URL direta: `/orders/{id}/cancel`
- URL gateway: `/api/orders/{id}/cancel`
- Parametros de rota:
  - `id` (long)
- Body: nao possui

Respostas:
- `200 OK` — `OrderResponse` com status `CANCELLED`
- `500 Internal Server Error` — pedido nao encontrado

---

### Consideracoes de Seguranca
Estado atual:
- Nao ha autenticacao/autorizacao aplicada nos endpoints.
- Todos os endpoints sao publicos.

Recomendacao:
- Aplicar validacao JWT no gateway e na API.
- Criacao e cancelamento devem validar que o usuario e o dono do pedido.
- Atualizacao de status deve exigir perfil admin.

---

### Implantacao
Servico em Docker Compose:
- `orderapi` expondo porta `5004` externa para `8080` interna.
- Gateway Nginx roteando `/api/orders/*` para `orderapi:8080` (com rewrite).
- Health check via Actuator em `curl -f http://localhost:8080/actuator/health`.
- Dependencias: `postgres` e `rabbitmq` (ambos com `service_healthy`).

Comandos principais:
```bash
docker compose up --build orderapi
docker compose logs orderapi
```

---

### Testes
Fluxo recomendado de validacao funcional:
1. `POST /orders` — criar pedido
2. `GET /orders` — listar todos
3. `GET /orders/{id}` — buscar por ID
4. `GET /orders/user/{userId}` — buscar por usuario
5. `PATCH /orders/{id}/status?status=APPROVED` — atualizar status
6. `POST /orders/{id}/cancel` — cancelar pedido

Cenarios de erro importantes:
- Buscar pedido inexistente (`500`).
- Cancelar pedido inexistente (`500`).

---

### Referencias
- `services/order/OrderAPI/OrderAPI/src/main/java/com/projeto6/OrderAPI/controller/OrderController.java`
- `services/order/OrderAPI/OrderAPI/src/main/java/com/projeto6/OrderAPI/service/OrderService.java`
- `services/order/OrderAPI/OrderAPI/src/main/java/com/projeto6/OrderAPI/dto`
- `services/order/OrderAPI/OrderAPI/src/main/java/com/projeto6/OrderAPI/model`
- `services/order/OrderAPI/OrderAPI/src/main/resources/application.properties`
- `gateway/nginx.conf`
- `http://localhost:5004/swagger-ui.html`

