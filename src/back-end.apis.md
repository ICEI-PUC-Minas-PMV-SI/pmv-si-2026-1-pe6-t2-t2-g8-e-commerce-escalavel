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

A API utiliza um `GlobalExceptionHandler` centralizado que intercepta excecoes e retorna respostas padronizadas.

| Situacao | Status | Mensagem |
|----------|--------|----------|
| Recurso nao encontrado | `404 Not Found` | Mensagem descritiva (ex: "Produto nao encontrado") |
| Erro interno nao esperado | `500 Internal Server Error` | "Erro interno no servidor" |

Formato padrao do erro:
```json
{
  "timestamp": "2026-04-08T19:11:09",
  "status": 404,
  "error": "Produto nao encontrado"
}
```

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
- `catalogapi` expondo porta `5002` externa para `5002` interna.
- Gateway Nginx roteando `/api/catalog/*` para `catalogapi:5002`.
- Health check via Actuator em `/actuator/health`.

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
