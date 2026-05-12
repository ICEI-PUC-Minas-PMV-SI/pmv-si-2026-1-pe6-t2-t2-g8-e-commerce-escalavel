# Front-end Web

[Inclua uma breve descrição do projeto e seus objetivos.]

## Projeto da Interface Web

[Descreva o projeto da interface Web da aplicação, incluindo o design visual, layout das páginas, interações do usuário e outros aspectos relevantes.]

### Wireframes

[Inclua os wireframes das páginas principais da interface, mostrando a disposição dos elementos na página.]

### Design Visual

[Descreva o estilo visual da interface, incluindo paleta de cores, tipografia, ícones e outros elementos gráficos.]

## Fluxo de Dados

[Diagrama ou descrição do fluxo de dados na aplicação.]

## Tecnologias Utilizadas
[Lista das tecnologias principais que serão utilizadas no projeto.]

## Considerações de Segurança

[Discuta as considerações de segurança relevantes para a aplicação distribuída, como autenticação, autorização, proteção contra ataques, etc.]

## Implantação

[Instruções para implantar a aplicação distribuída em um ambiente de produção.]

1. Defina os requisitos de hardware e software necessários para implantar a aplicação em um ambiente de produção.
2. Escolha uma plataforma de hospedagem adequada, como um provedor de nuvem ou um servidor dedicado.
3. Configure o ambiente de implantação, incluindo a instalação de dependências e configuração de variáveis de ambiente.
4. Faça o deploy da aplicação no ambiente escolhido, seguindo as instruções específicas da plataforma de hospedagem.
5. Realize testes para garantir que a aplicação esteja funcionando corretamente no ambiente de produção.

## Testes

### Estratégia

Testes funcionais manuais executados em ambiente local, cobrindo as interações do **módulo de Estoque (Stock)** no frontend web. Cada caso descreve apenas o caminho feliz. Validações de entrada, mensagens de erro, estados vazios, autenticação, performance, segurança e automação ficam fora deste escopo.

---

## Testes — Módulo de Estoque (Stock)

### Mapeamento de interações

Origem: `src/frontend/stock/`, `src/frontend/services/stockClientService.ts`. Página única em `/stock`.

| ID  | Interação                            | Componente                               | API back-end                          |
|-----|--------------------------------------|------------------------------------------|---------------------------------------|
| I1  | Listar itens com dados de produto    | `stockListPage.tsx`                      | `GET /stock/detailed-items`           |
| I2  | Buscar item por SKU/nome/código      | `stockListPage.tsx` (filtro client-side) | —                                     |
| I3  | Copiar SKU para clipboard            | `stockListPage.tsx` (`handleCopy`)       | —                                     |
| I4  | Criar item de estoque                | `CreateStockModal.tsx`                   | `POST /stock`                         |
| I5  | Reabastecer item                     | `RestockModal.tsx`                       | `PUT /stock/{skuId}/restock`          |
| I6  | Ajustar item (delta + motivo)        | `AdjustModal.tsx`                        | `PUT /stock/{skuId}/adjust`           |
| I7  | Visualizar histórico de movimentos   | `HistoryDrawer.tsx`                      | `GET /stock/{skuId}/history`          |

### Casos de teste

#### Stock — I1: Listagem

##### TC-I1-01 · Carregar lista de itens

- **Pré-condições:**
  - Back-end ativo.
  - Há ≥ 1 item cadastrado.
- **Passos:**
  1. Abrir `/stock`.
- **Resultado esperado:**
  - Tabela exibe colunas: Produto, SKU, Disponível, Reservado, Custo, Ações.
  - Cada linha mostra imagem, nome, código/tamanho, quantidades e custo formatado em BRL.

---

#### Stock — I2: Busca

##### TC-I2-01 · Filtrar por trecho do SKU

- **Pré-condições:**
  - Lista carregada com ≥ 2 itens de SKUs distintos.
- **Passos:**
  1. Digitar um trecho do SKU de um item no campo de busca.
- **Resultado esperado:**
  - Tabela mantém apenas linhas cujo SKU contém o trecho informado.

##### TC-I2-02 · Filtrar por nome do produto

- **Pré-condições:**
  - Lista carregada.
- **Passos:**
  1. Digitar parte do nome de um produto no campo de busca.
- **Resultado esperado:**
  - Tabela exibe apenas itens cujo nome contém o trecho.

##### TC-I2-03 · Filtrar por código do produto

- **Pré-condições:**
  - Lista carregada com produtos que possuem `code` definido.
- **Passos:**
  1. Digitar parte de um código no campo de busca.
- **Resultado esperado:**
  - Tabela exibe apenas itens cujo código contém o trecho.

##### TC-I2-04 · Limpar busca

- **Pré-condições:**
  - Filtro ativo na busca.
- **Passos:**
  1. Apagar o conteúdo do campo de busca.
- **Resultado esperado:**
  - Tabela retorna ao conjunto completo de itens.

---

#### Stock — I3: Copiar SKU

##### TC-I3-01 · Copiar SKU da linha

- **Pré-condições:**
  - Lista carregada.
- **Passos:**
  1. Clicar sobre o SKU exibido em uma linha.
- **Resultado esperado:**
  - Conteúdo do SKU é gravado no clipboard do sistema.

---

#### Stock — I4: Criar item

##### TC-I4-01 · Criar item com dados válidos

- **Pré-condições:**
  - Existe SKU UUID válido sem item de estoque associado.
- **Passos:**
  1. Clicar em **Novo item**.
  2. Informar o SKU UUID válido.
  3. Definir Quantidade inicial = `10`.
  4. Definir Custo = `19.90`.
  5. Clicar em **Criar**.
- **Resultado esperado:**
  - Modal fecha.
  - Lista é recarregada e exibe o novo item com `quantityAvailable = 10` e custo R$ 19,90.

##### TC-I4-02 · Resetar campos ao reabrir

- **Pré-condições:**
  - Modal aberto com campos preenchidos.
- **Passos:**
  1. Clicar em **Cancelar**.
  2. Reabrir **Novo item**.
- **Resultado esperado:**
  - Campos retornam aos defaults: SKU vazio, quantidade `0`, custo `0`.

---

#### Stock — I5: Reabastecer

##### TC-I5-01 · Reabastecer com quantidade positiva

- **Pré-condições:**
  - Item de estoque existente com `quantityAvailable = N`.
- **Passos:**
  1. Na linha do item, clicar em **Reabastecer**.
  2. Definir Quantidade = `5`.
  3. Clicar em **Reabastecer**.
- **Resultado esperado:**
  - Modal fecha.
  - Linha do item passa a exibir `quantityAvailable = N + 5`.

##### TC-I5-02 · SKU exibido bloqueado

- **Pré-condições:**
  - Modal de reabastecer aberto.
- **Passos:**
  1. Tentar editar o campo SKU.
- **Resultado esperado:**
  - Campo permanece somente-leitura, mostrando o SKU do item alvo.

---

#### Stock — I6: Ajustar

##### TC-I6-01 · Ajuste positivo

- **Pré-condições:**
  - Item com `quantityAvailable = N`.
- **Passos:**
  1. Na linha do item, clicar em **Ajustar**.
  2. Definir Delta = `+3`.
  3. Informar Motivo = `entrada extra de fornecedor`.
  4. Clicar em **Ajustar**.
- **Resultado esperado:**
  - Modal fecha.
  - Linha do item passa a exibir `quantityAvailable = N + 3`.

##### TC-I6-02 · Ajuste negativo dentro do disponível

- **Pré-condições:**
  - Item com `quantityAvailable ≥ 2`.
- **Passos:**
  1. Na linha do item, clicar em **Ajustar**.
  2. Definir Delta = `-2`.
  3. Informar Motivo = `contagem física`.
  4. Clicar em **Ajustar**.
- **Resultado esperado:**
  - Modal fecha.
  - Linha do item passa a exibir `quantityAvailable = N - 2`.

---

#### Stock — I7: Histórico

##### TC-I7-01 · Abrir histórico de um SKU

- **Pré-condições:**
  - Item com ≥ 1 movimento registrado.
- **Passos:**
  1. Na linha do item, clicar em **Histórico**.
- **Resultado esperado:**
  - Drawer lateral abre.
  - Lista exibe cada movimento com tipo, quantidade (com sinal) e data formatada em pt-BR.

##### TC-I7-02 · Movimento com pedido associado

- **Pré-condições:**
  - Existe movimento `reserve`, `release` ou `confirm` com `orderId` preenchido.
- **Passos:**
  1. Abrir o histórico do SKU correspondente.
- **Resultado esperado:**
  - Item do histórico exibe a linha `Pedido: <uuid>`.

##### TC-I7-03 · Movimento com motivo

- **Pré-condições:**
  - Existe movimento de `adjustment` com `reason` preenchido.
- **Passos:**
  1. Abrir o histórico do SKU correspondente.
- **Resultado esperado:**
  - Item do histórico exibe a linha `Motivo: <texto>`.

##### TC-I7-04 · Rótulos por tipo de movimento

- **Pré-condições:**
  - Existem movimentos de tipos distintos no SKU.
- **Passos:**
  1. Abrir o histórico.
- **Resultado esperado:**
  - Cada movimento exibe o rótulo PT-BR correspondente: Reserva, Liberação, Confirmação, Reabastecimento, Ajuste.

##### TC-I7-05 · Fechar drawer

- **Pré-condições:**
  - Drawer aberto.
- **Passos:**
  1. Clicar no botão `×` do cabeçalho **ou** na área escurecida fora do painel.
- **Resultado esperado:**
  - Drawer fecha.

##### TC-I7-06 · Reabrir mesmo SKU recarrega histórico

- **Pré-condições:**
  - Drawer fechado após visualização.
- **Passos:**
  1. Clicar em **Histórico** novamente na mesma linha.
- **Resultado esperado:**
  - Drawer abre e refaz a chamada de carga, exibindo a lista atualizada de movimentos.

---

## Testes — Módulo de Notificações (Notifications)

### Mapeamento de interações

Origem: `src/frontend/notification/`, `src/frontend/services/notificationApi.ts`. Página única em `/notifications`.

| ID | Interação | Componente | API back-end |
|-----|--------------------------------------|------------------------------------------|---------------------------------------|
| I8 | Listar notificações do usuário | `NotificationPage.tsx` | `GET /notifications` |
| I9 | Exibir contador de não lidas (Badge) | `NotificationBell.tsx` | `GET /notifications/unread-count` |
| I10 | Marcar notificação como lida | `NotificationPage.tsx` | `PATCH /notifications/{id}/read` |
| I11 | Redirecionamento para a central | `Header.tsx` (Link no sino) | — |

### Casos de teste

#### Notifications — I8: Listagem

##### TC-I8-01 · Carregar lista de notificações

- **Pré-condições:**
  - Back-end ativo.
  - Usuário autenticado possui notificações enviadas.
- **Passos:**
  1. Abrir a página `/notifications`.
- **Resultado esperado:**
  - A tela exibe cards com: Mensagem, Data de recebimento e Status.
  - Notificações não lidas possuem destaque visual diferenciado das lidas.

---

#### Notifications — I9: Contador

##### TC-I9-01 · Visualizar badge no Header

- **Pré-condições:**
  - Usuário possui ≥ 1 notificação não lida.
- **Passos:**
  1. Observar o ícone de sino no cabeçalho em qualquer página.
- **Resultado esperado:**
  - Badge vermelho exibe o numeral correspondente ao total de mensagens pendentes.

---

#### Notifications — I10: Ações

##### TC-I10-01 · Alterar status para lido

- **Pré-condições:**
  - Lista carregada com notificações não lidas.
- **Passos:**
  1. Clicar em "Marcar como lida" em um item da lista.
- **Resultado esperado:**
  - O card da notificação perde o destaque de "nova".
  - O contador no Header (Badge) é atualizado subtraindo 1 unidade.

---

#### Notifications — I11: Navegação

##### TC-I11-01 · Acesso via cabeçalho

- **Pré-condições:**
  - Usuário logado em qualquer rota do sistema.
- **Passos:**
  1. Clicar sobre o ícone do sino no Header.
- **Resultado esperado:**
  - O sistema redireciona o usuário para a página `/notifications`.

---

# Testes — Módulo de Pedidos (Order)

## Mapeamento de interações

Origem: `src/frontend/order/`, `src/frontend/services/orderClientService.ts`.

| ID  | Interação                         | Componente              | API back-end                      |
|-----|----------------------------------|--------------------------|-----------------------------------|
| I12 | Visualizar itens do carrinho     | `CartPage.tsx`          | `GET /cart`                       |
| I13 | Adicionar item ao carrinho       | `ProductPage.tsx`       | `POST /cart/items`               |
| I14 | Remover item do carrinho         | `CartPage.tsx`          | `DELETE /cart/items/{id}`        |
| I15 | Alterar quantidade do item        | `CartPage.tsx`          | `PUT /cart/items/{id}`           |
| I16 | Finalizar compra (checkout)      | `CheckoutPage.tsx`      | `POST /orders`                   |
| I17 | Visualizar pedidos realizados     | `OrdersPage.tsx`        | `GET /orders`                    |
| I18 | Visualizar detalhes de um pedido  | `OrderDetailsPage.tsx`   | `GET /orders/{id}`              |

---

## Casos de teste


### Order — I12: Carrinho

#### TC-I12-01 · Listar itens do carrinho

- **Pré-condições:**
  - Usuário possui itens no carrinho.

- **Passos:**
  1. Acessar a página do carrinho (`/cart`).

- **Resultado esperado:**
  - Lista de produtos exibida com:
    - Imagem
    - Nome
    - Preço unitário
    - Quantidade
    - Subtotal

---

### Order — I13: Adicionar ao carrinho

#### TC-I13-01 · Adicionar produto ao carrinho

- **Pré-condições:**
  - Usuário está na página de produto.

- **Passos:**
  1. Clicar em “Adicionar ao carrinho”.

- **Resultado esperado:**
  - Produto é adicionado ao carrinho.
  - Carrinho é atualizado corretamente.

---

### Order — I14: Remover item

#### TC-I14-01 · Remover item do carrinho

- **Pré-condições:**
  - Carrinho possui pelo menos 1 item.

- **Passos:**
  1. Clicar no ícone de lixeira no item do carrinho.
  2. Clicar em "Remover" no modal de confirmação.

- **Resultado esperado:**
  - Item é removido da lista.
  - Total do carrinho é atualizado.

---

### Order — I15: Alterar quantidade

#### TC-I15-01 · Aumentar quantidade

- **Pré-condições:**
  - Item presente no carrinho.

- **Passos:**
  1. Clicar no botão com ícone "+" do item.

- **Resultado esperado:**
  - Subtotal e total são atualizados corretamente.

---

#### TC-I15-02 · Diminuir quantidade

- **Pré-condições:**
  - Item com quantidade ≥ 2.

- **Passos:**
  1. Clicar no botão com icone "-" do item.

- **Resultado esperado:**
  - Quantidade atualiza corretamente sem valores negativos.

---

### Order — I16: Checkout

#### TC-I16-01 · Finalizar compra com sucesso

- **Pré-condições:**
  - Carrinho possui itens.
  - Usuário autenticado.

- **Passos:**
  1. Acessar checkout.
  2. Preencher informações de endereço.
  3. Confirmar compra.

- **Resultado esperado:**
  - Pedido é criado com sucesso.
  - Carrinho é esvaziado.
  - Usuário é redirecionado para confirmação.

---

### Order — I17: Lista de pedidos

#### TC-I17-01 · Listar pedidos do usuário

- **Pré-condições:**
  - Usuário possui pedidos realizados.

- **Passos:**
  1. Acessar página `/orders`.

- **Resultado esperado:**
  - Lista de pedidos exibida com:
    - ID do pedido
    - Data
    - Status
    - Valor total

---

### Order — I18: Detalhes do pedido

#### TC-I18-01 · Visualizar detalhes do pedido

- **Pré-condições:**
  - Usuário possui pedidos.

- **Passos:**
  1. Clicar em um pedido da lista.

- **Resultado esperado:**
  - Tela de detalhes exibida com:
    - Itens do pedido
    - Quantidade
    - Preços
    - Status do pedido

---

  ---

  ## Testes — Módulo de Catálogo: Produtos

  ### Mapeamento de interações

  Origem: `src/frontend/catalog/pages/ProductsPage.jsx`,
  `src/frontend/services/api.js`. Página em `/products`.

  | ID  | Interação | Componente | API back-end                                                                         |
  |-----|-----------|------------|------------                                                                          |
  | I19 | Listar e filtrar produtos | `ProductsPage.jsx` | `GET /catalog/products?name=&categoryId=&minPrice=&maxPrice=` |
  | I20 | Criar produto  | `ProductModal` (admin)| `POST /catalog/products`                                             |
  | I21 | Editar produto | `ProductModal` (admin) | `PUT /catalog/products/{id}`                                        |
  | I22 | Deletar produto | `ConfirmModal` (admin) | `DELETE /catalog/products/{id}`                                     |

  ### Casos de teste

  #### Produtos — I19: Listagem e filtros

  ##### TC-I19-01 · Carregar lista de produtos

  - **Pré-condições:**
    - Back-end ativo.
    - Há ≥ 1 produto cadastrado.
  - **Passos:**
    1. Abrir `/products`.
  - **Resultado esperado:**
    - Cards de produto são exibidos com: imagem, categoria, nome, descrição
  resumida e preço a partir de (formatado em BRL).
    - Contador de resultados é exibido acima da grade.

  ##### TC-I19-02 · Filtrar por nome

  - **Pré-condições:**
    - Lista carregada com ≥ 2 produtos de nomes distintos.
  - **Passos:**
    1. Digitar parte do nome de um produto no campo "Buscar por nome...".
    2. Clicar em **Filtrar**.
  - **Resultado esperado:**
    - A grade exibe apenas produtos cujo nome contém o trecho informado.

  ##### TC-I19-03 · Filtrar por categoria

  - **Pré-condições:**
    - Lista carregada com produtos de categorias distintas.
  - **Passos:**
    1. Selecionar uma categoria no campo de seleção.
    2. Clicar em **Filtrar**.
  - **Resultado esperado:**
    - A grade exibe apenas produtos pertencentes à categoria selecionada.

  ##### TC-I19-04 · Filtrar por faixa de preço

  - **Pré-condições:**
    - Existem produtos com preços variados.
  - **Passos:**
    1. Informar **Preço mínimo** e **Preço máximo**.
    2. Clicar em **Filtrar**.
  - **Resultado esperado:**
    - A grade exibe apenas produtos com ao menos um SKU cujo preço está dentro
   da faixa informada.

  ##### TC-I19-05 · Limpar filtros

  - **Pré-condições:**
    - Filtros ativos com resultados parciais.
  - **Passos:**
    1. Clicar em **Limpar**.
  - **Resultado esperado:**
    - Campos de filtro são resetados e a lista completa de produtos é
  recarregada.

  ---

  #### Produtos — I20: Criar produto

  ##### TC-I20-01 · Criar produto com dados válidos (admin)

  - **Pré-condições:**
    - Usuário autenticado com perfil `admin`.
  - **Passos:**
    1. Clicar em **+ Novo Produto**.
    2. Preencher **Nome**, **Descrição**, **URL da imagem** e selecionar uma
  **Categoria**.
    3. Clicar em **Criar produto**.
  - **Resultado esperado:**
    - Modal fecha.
    - Novo card do produto aparece no início da grade sem recarregar a página.

  ---

  #### Produtos — I21: Editar produto

  ##### TC-I21-01 · Editar produto existente (admin)

  - **Pré-condições:**
    - Usuário autenticado com perfil `admin`.
    - Há ≥ 1 produto cadastrado.
  - **Passos:**
    1. Passar o cursor sobre o card do produto — botões **Editar** e
  **Deletar** ficam visíveis.
    2. Clicar em **Editar**.
    3. Alterar ao menos um campo (ex.: nome).
    4. Clicar em **Salvar alterações**.
  - **Resultado esperado:**
    - Modal fecha.
    - Card do produto na grade reflete os novos dados sem recarregar a página.

  ---

  #### Produtos — I22: Deletar produto

  ##### TC-I22-01 · Deletar produto com confirmação (admin)

  - **Pré-condições:**
    - Usuário autenticado com perfil `admin`.
    - Há ≥ 1 produto cadastrado.
  - **Passos:**
    1. Passar o cursor sobre o card do produto.
    2. Clicar em **Deletar**.
    3. Clicar em **Deletar** no modal de confirmação.
  - **Resultado esperado:**
    - Modal de confirmação fecha.
    - Card do produto é removido da grade imediatamente.

  ##### TC-I22-02 · Cancelar exclusão

  - **Pré-condições:**
    - Modal de confirmação de exclusão aberto.
  - **Passos:**
    1. Clicar em **Cancelar** ou na área escurecida fora do modal.
  - **Resultado esperado:**
    - Modal fecha.
    - Produto permanece na grade.

  ---

  ## Testes — Módulo de Catálogo: Categorias

  ### Mapeamento de interações

  Origem: `src/frontend/catalog/pages/CategoriesPage.jsx`,
  `src/frontend/services/api.js`. Página em `/categories`.

 Testes — Módulo de Catálogo: Categorias
Mapeamento de interações
Origem: src/frontend/catalog/pages/CategoriesPage.jsx, src/frontend/services/api.js. Página em /categories.

 | ID  | Interação                      | Componente           | API back-end|
  |-----|--------------------------------|----------------------|---------------------------------------|
  | I23 | Listar categorias              | `CategoriesPage.jsx` | `GET /catalog/categories`             |
  | I24 | Listar produtos das categorias | `CategoriesPage.jsx` | `GET /products?categoryId={id}`       |
  | I25 | Criar categoria                | `CategoriesPage.jsx` | `POST /catalog/categories`            |
  | I26 | Editar categoria               | `CategoriesPage.jsx` | `PUT  /catalog/categories/{id}`        |
  | I27 | Deletar categoria              | `CategoriesPage.jsx` | `DELETE /catalog/categories/{id}`     |

  ### Casos de teste

  #### Categorias — I23: Listagem

  ##### TC-I23-01 · Carregar lista de categorias

  - **Pré-condições:**
    - Back-end ativo.
    - Há ≥ 1 categoria cadastrada.
  - **Passos:**
    1. Abrir `/categories`.
  - **Resultado esperado:**
    - Grade exibe cartões com nome e descrição (quando disponível) de cada categoria.
    - Cada cartão exibe o link **Ver produtos →**.

  ---

  #### Categorias — I24: Navegação

  ##### TC-I24-01 · Clicar em categoria redireciona para lista de produtos filtrada

  - **Pré-condições:**
    - Página `/categories` carregada com ≥ 1 categoria.
  - **Passos:**
    1. Clicar em qualquer cartão de categoria.
  - **Resultado esperado:**
    - Navegação para `/products?categoryId={id}` da categoria selecionada.
    - Página de produtos abre já filtrada pela categoria correspondente.

  ---

  #### Categorias — I25: Criar

  ##### TC-I25-01 · Criar categoria com dados válidos

  - **Pré-condições:**
    - Back-end ativo.
  - **Passos:**
    1. Clicar em **+ Nova Categoria**.
    2. Preencher Nome = `Calçados`.
    3. Preencher Descrição = `Tênis, sapatos e sandálias`.
    4. Clicar em **Criar categoria**.
  - **Resultado esperado:**
    - Modal fecha.
    - Grid é atualizado e exibe o novo card `Calçados` no topo.

  ##### TC-I25-02 · Tentar criar sem nome

  - **Pré-condições:**
    - Modal de criação aberto.
  - **Passos:**
    1. Deixar o campo Nome vazio.
    2. Clicar em **Criar categoria**.
  - **Resultado esperado:**
    - Mensagem de erro "Nome é obrigatório." exibida; modal permanece aberto.

  ---

  #### Categorias — I26: Editar

  ##### TC-I26-01 · Editar nome de uma categoria

  - **Pré-condições:**
    - Lista carregada com ≥ 1 categoria.
  - **Passos:**
    1. Passar o cursor sobre um card para revelar os botões de ação.
    2. Clicar em **Editar**.
    3. Alterar o nome para `Acessórios`.
    4. Clicar em **Salvar alterações**.
  - **Resultado esperado:**
    - Modal fecha.
    - Card exibe o nome atualizado `Acessórios`.

  ---

  #### Categorias — I27: Deletar

  ##### TC-I27-01 · Deletar categoria com confirmação

  - **Pré-condições:**
    - Lista carregada com ≥ 1 categoria.
  - **Passos:**
    1. Passar o cursor sobre um card para revelar os botões de ação.
    2. Clicar em **Deletar**.
    3. Confirmar no modal de confirmação.
  - **Resultado esperado:**
    - Modal fecha.
    - Card removido do grid.

  ##### TC-I27-02 · Cancelar exclusão

  - **Pré-condições:**
    - Modal de confirmação de exclusão aberto.
  - **Passos:**
    1. Clicar em **Cancelar**.
  - **Resultado esperado:**
    - Modal fecha sem alterações no grid.


---

## Testes — Módulo de Usuários (User)

### Mapeamento de interações

Origem: `src/frontend/user/pages/`, `src/frontend/services/userApi.ts`.

| ID  | Interação                              | Componente                | API back-end                              |
|-----|----------------------------------------|---------------------------|-------------------------------------------|
| I25 | Login com e-mail e senha               | `LoginPage.tsx`           | `POST /auth/login`                        |
| I26 | Cadastro de novo usuário               | `RegisterPage.tsx`        | `POST /auth/register`                     |
| I27 | Visualizar perfil                      | `ProfilePage.tsx`         | `GET /users/{id}`                         |
| I28 | Editar dados pessoais e endereço       | `EditProfilePage.tsx`     | `PUT /users/{id}`                         |
| I29 | Alterar senha                          | `ChangePasswordPage.tsx`  | `PUT /users/{id}/password`                |
| I30 | Desativar conta                        | `ProfilePage.tsx`         | `DELETE /users/{id}`                      |
| I31 | Listar todos os usuários (admin)       | `AdminUsersPage.tsx`      | `GET /admin/users`                        |
| I32 | Desativar / reativar usuário (admin)   | `AdminUsersPage.tsx`      | `DELETE /users/{id}` / `PUT /users/{id}/reactivate` |
| I33 | Excluir usuário permanentemente (admin)| `AdminUsersPage.tsx`      | `DELETE /admin/users/{id}/hard`           |

---

### Casos de teste

#### User — I25: Login

##### TC-I25-01 · Login com credenciais válidas

- **Pré-condições:**
  - Usuário cadastrado e ativo no sistema.
- **Passos:**
  1. Acessar `/login`.
  2. Preencher e-mail e senha corretos.
  3. Clicar em **Entrar**.
- **Resultado esperado:**
  - Usuário é autenticado e redirecionado para `/products`.
  - Header exibe avatar e nome do usuário.

##### TC-I25-02 · Login com credenciais inválidas

- **Pré-condições:**
  - Página de login aberta.
- **Passos:**
  1. Preencher e-mail correto e senha errada.
  2. Clicar em **Entrar**.
- **Resultado esperado:**
  - Mensagem de erro exibida abaixo do formulário.
  - Usuário permanece na página de login.

##### TC-I25-03 · Validação de campo e-mail

- **Pré-condições:**
  - Página de login aberta.
- **Passos:**
  1. Digitar um e-mail com formato inválido (ex.: `usuario@`).
  2. Sair do campo (blur).
- **Resultado esperado:**
  - Ícone de erro exibido no campo e-mail.
  - Mensagem de validação visível antes de submeter o formulário.

##### TC-I25-04 · Redirecionar usuário já autenticado

- **Pré-condições:**
  - Usuário já autenticado.
- **Passos:**
  1. Tentar acessar `/login` diretamente pela URL.
- **Resultado esperado:**
  - Sistema redireciona automaticamente para `/products`.

---

#### User — I26: Cadastro

##### TC-I26-01 · Cadastro em dois passos com dados válidos

- **Pré-condições:**
  - Nenhuma conta com o e-mail informado existe.
- **Passos:**
  1. Acessar `/cadastro`.
  2. Passo 1: preencher nome (≥ 3 chars), e-mail válido, senha (≥ 8 chars).
  3. Clicar em **Continuar**.
  4. Passo 2: preencher CPF e telefone (opcionais) ou prosseguir em branco.
  5. Clicar em **Criar conta**.
- **Resultado esperado:**
  - Conta criada com sucesso.
  - Usuário é autenticado e redirecionado para `/products`.

##### TC-I26-02 · Máscara automática de CPF

- **Pré-condições:**
  - Passo 2 do cadastro visível.
- **Passos:**
  1. Digitar 11 dígitos no campo CPF.
- **Resultado esperado:**
  - Campo exibe automaticamente o formato `000.000.000-00`.

##### TC-I26-03 · Máscara automática de telefone

- **Pré-condições:**
  - Passo 2 do cadastro visível.
- **Passos:**
  1. Digitar 11 dígitos no campo Telefone.
- **Resultado esperado:**
  - Campo exibe automaticamente o formato `(00) 00000-0000`.

##### TC-I26-04 · Barra de força de senha

- **Pré-condições:**
  - Campo Senha no passo 1 visível.
- **Passos:**
  1. Digitar senhas de diferentes complexidades (só letras, com número, com símbolo).
- **Resultado esperado:**
  - Barra de força muda de cor e nível (fraca → média → forte) conforme a complexidade.

---

#### User — I27: Visualizar Perfil

##### TC-I27-01 · Carregar dados do perfil

- **Pré-condições:**
  - Usuário autenticado.
- **Passos:**
  1. Acessar `/perfil`.
- **Resultado esperado:**
  - Hero exibe nome, e-mail, data de membro e iniciais do avatar.
  - Strip de estatísticas exibe CPF, telefone e cidade (ou `—` se não informado).
  - Cards exibem dados pessoais, endereço, segurança e zona de perigo.

##### TC-I27-02 · Acesso negado sem autenticação

- **Pré-condições:**
  - Usuário não autenticado.
- **Passos:**
  1. Tentar acessar `/perfil` diretamente pela URL.
- **Resultado esperado:**
  - Sistema redireciona para `/login`.

---

#### User — I28: Editar Perfil

##### TC-I28-01 · Atualizar nome e e-mail

- **Pré-condições:**
  - Usuário autenticado em `/perfil/editar`.
- **Passos:**
  1. Alterar o campo **Nome completo**.
  2. Alterar o campo **E-mail**.
  3. Clicar em **Salvar alterações**.
- **Resultado esperado:**
  - Toast de sucesso exibido.
  - Botão **Salvar** muda para **Salvo!** com ícone de check.
  - Usuário é redirecionado para `/perfil` após 1,6 s.
  - Header reflete o novo nome imediatamente.

##### TC-I28-02 · Máscara de CEP

- **Pré-condições:**
  - Formulário de edição aberto.
- **Passos:**
  1. Digitar 8 dígitos no campo CEP.
- **Resultado esperado:**
  - Campo exibe automaticamente o formato `00000-000`.

---

#### User — I29: Alterar Senha

##### TC-I29-01 · Alterar senha com dados válidos

- **Pré-condições:**
  - Usuário autenticado em `/perfil/senha`.
- **Passos:**
  1. Preencher **Senha atual** corretamente.
  2. Preencher **Nova senha** (≥ 8 chars).
  3. Repetir a nova senha em **Confirmar nova senha**.
  4. Clicar em **Salvar nova senha**.
- **Resultado esperado:**
  - Toast de sucesso exibido.
  - Formulário é resetado.

##### TC-I29-02 · Confirmação de senha divergente

- **Pré-condições:**
  - Formulário de alteração de senha aberto.
- **Passos:**
  1. Preencher **Nova senha** e **Confirmar nova senha** com valores diferentes.
  2. Clicar em **Salvar nova senha**.
- **Resultado esperado:**
  - Mensagem de erro indicando que as senhas não coincidem.
  - Requisição não é enviada ao back-end.

---

#### User — I30: Desativar Conta

##### TC-I30-01 · Desativar conta com confirmação

- **Pré-condições:**
  - Usuário autenticado na página `/perfil`.
- **Passos:**
  1. Clicar em **Desativar minha conta**.
  2. Confirmar no modal clicando em **Confirmar**.
- **Resultado esperado:**
  - Toast de sucesso exibido.
  - Usuário é deslogado e redirecionado para `/login` após 2 s.

##### TC-I30-02 · Cancelar desativação

- **Pré-condições:**
  - Modal de confirmação aberto.
- **Passos:**
  1. Clicar em **Cancelar**.
- **Resultado esperado:**
  - Modal fecha sem nenhuma ação.
  - Conta permanece ativa.

---

#### User — I31: Listagem de Usuários (Admin)

##### TC-I31-01 · Carregar lista de usuários

- **Pré-condições:**
  - Usuário autenticado com perfil `admin`.
- **Passos:**
  1. Acessar `/admin/usuarios`.
- **Resultado esperado:**
  - Hero exibe estatísticas: total, ativos, inativos e admins.
  - Tabela lista todos os usuários com nome, e-mail, CPF, telefone, cargo e status.

##### TC-I31-02 · Filtrar por aba (Ativos / Inativos / Todos)

- **Pré-condições:**
  - Lista carregada com usuários ativos e inativos.
- **Passos:**
  1. Clicar na aba **Ativos**.
- **Resultado esperado:**
  - Tabela exibe apenas usuários com status ativo.
  - Toast exibe contagem: `Exibindo N usuários ativos.`

##### TC-I31-03 · Buscar usuário por nome ou e-mail

- **Pré-condições:**
  - Lista carregada.
- **Passos:**
  1. Digitar parte do nome ou e-mail no campo de busca.
- **Resultado esperado:**
  - Tabela filtra em tempo real exibindo apenas os registros correspondentes.

##### TC-I31-04 · Atualizar lista manualmente

- **Pré-condições:**
  - Página de admin carregada.
- **Passos:**
  1. Clicar no botão **Atualizar**.
- **Resultado esperado:**
  - Ícone do botão gira enquanto carrega.
  - Toast de sucesso exibe o total de usuários carregados.

---

#### User — I32: Desativar / Reativar Usuário (Admin)

##### TC-I32-01 · Desativar usuário ativo

- **Pré-condições:**
  - Admin autenticado. Há ao menos 1 usuário ativo na lista.
- **Passos:**
  1. Clicar em **Desativar** na linha do usuário.
  2. Confirmar no modal.
- **Resultado esperado:**
  - Status do usuário muda para **Inativo** na tabela sem recarregar a página.
  - Toast de sucesso exibido.

##### TC-I32-02 · Reativar usuário inativo

- **Pré-condições:**
  - Admin autenticado. Há ao menos 1 usuário inativo.
- **Passos:**
  1. Clicar na aba **Inativos**.
  2. Clicar em **Reativar** na linha do usuário.
  3. Confirmar no modal.
- **Resultado esperado:**
  - Status muda para **Ativo** na tabela.
  - Toast de sucesso exibido.

---

#### User — I33: Excluir Usuário Permanentemente (Admin)

##### TC-I33-01 · Excluir usuário com confirmação

- **Pré-condições:**
  - Admin autenticado. Há ao menos 1 usuário na lista.
- **Passos:**
  1. Clicar no ícone de lixeira (excluir) na linha do usuário.
  2. Ler o aviso de ação irreversível no modal.
  3. Clicar em **Excluir permanentemente**.
- **Resultado esperado:**
  - Usuário é removido da tabela imediatamente.
  - Toast de sucesso exibido.
  - Estatísticas do hero são atualizadas.

##### TC-I33-02 · Acesso bloqueado para não-admin

- **Pré-condições:**
  - Usuário autenticado com perfil `customer`.
- **Passos:**
  1. Tentar acessar `/admin/usuarios` pela URL.
- **Resultado esperado:**
  - Sistema redireciona para `/`.

---

# Referências

Inclua todas as referências (livros, artigos, sites, etc) utilizados no desenvolvimento do trabalho.
