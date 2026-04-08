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
