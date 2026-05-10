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
# Referências

Inclua todas as referências (livros, artigos, sites, etc) utilizados no desenvolvimento do trabalho.
