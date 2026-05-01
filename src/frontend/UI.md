# UI — Mapa de Telas (Frontend Web)

> Documento de planejamento da interface. Define **quais telas** serão criadas, **para quem**, **o que cada uma resolve** e quais requisitos/HU cobre. Não inclui código nem wireframes finais (esses ficarão em `docs/img/` em etapa posterior).

---

## 1. Visão Geral

A plataforma é uma loja virtual de roupas com foco em inclusão (variedade de numerações, incluindo plus size). A interface web atende **dois perfis distintos** definidos em [docs/contexto.md](contexto.md):

- **Cliente final (B2C)** — navegação, compra e acompanhamento de pedidos.
- **Administrador / Lojista (B2B)** — gestão de catálogo, estoque, pedidos e estornos.

A separação é feita por **rotas** (`/` cliente, `/admin/*` administrativo) e por **role** no token JWT emitido pelo `UserService`. O frontend (React) consome **exclusivamente** o API Gateway (Nginx, porta 8080), conforme RNF-004.

---

## 2. Princípios de Design

| Princípio | O que significa na prática |
|-----------|---------------------------|
| **Inclusão como diferencial** | Filtro de tamanho em destaque (não escondido em "mais filtros"). Linguagem neutra. Tabela de medidas acessível em toda página de produto. |
| **Mobile-first** | Persona Lucas (24, smartphone, baixa tolerância a latência). Layouts pensados primeiro em 360–414px e expandidos para desktop. Cobre RNF-014. |
| **Feedback imediato** | Toda ação que envia request mostra estado (loading, sucesso, erro). Atende ao requisito de tempo de resposta < 3s percebido. |
| **Painel admin denso** | Persona Mariana (41, desktop, gerência). Tabelas, filtros, edição em linha. Não otimiza para mobile no admin. |
| **Acessibilidade básica** | Contraste AA, navegação por teclado, labels em formulários, alt em imagens. |

---

## 3. Mapa de Telas

Telas agrupadas por área. Cada tela rastreia **HU** e **RF** que cobre.

### 3.1 Área Pública / Autenticação

| # | Tela | Rota | Propósito | HU / RF |
|---|------|------|-----------|---------|
| 01 | **Home / Vitrine** | `/` | Landing com destaques, categorias, banners promocionais. Ponto de entrada. | HU-03 / RF-003 |
| 02 | **Login** | `/login` | Autenticação por e-mail e senha. Recebe token JWT. | HU-02 / RF-002 |
| 03 | **Cadastro** | `/cadastro` | Criação de conta (nome, e-mail, senha + confirmação). | HU-01 / RF-001 |

### 3.2 Catálogo e Compra (Cliente)

| # | Tela | Rota | Propósito | HU / RF |
|---|------|------|-----------|---------|
| 04 | **Catálogo / Listagem** | `/produtos` | Listagem com filtros (categoria, faixa de preço, **tamanho**) e busca por nome. Paginação. | HU-03 / RF-003 |
| 05 | **Detalhe do Produto** | `/produtos/:id` | Galeria, descrição, preço, seletor de tamanho, botão "Adicionar ao carrinho", tabela de medidas. | HU-04 / RF-004 |
| 06 | **Carrinho** | `/carrinho` | Itens selecionados, ajuste de quantidade, remoção, subtotal, CTA para checkout. | HU-05 / RF-005 |
| 07 | **Checkout** | `/checkout` | Endereço, método de pagamento (simulado), revisão do pedido, confirmação. | HU-06 / RF-006, RF-007, RF-008 |
| 08 | **Confirmação de Pedido** | `/pedidos/:id/confirmacao` | Tela de sucesso pós-checkout com nº do pedido e próximos passos. Aciona notificação por e-mail. | HU-09 / RF-011 |
| 09 | **Pagamento Recusado** | (estado de #07 ou rota `/checkout/recusado`) | Feedback claro e ações alternativas (trocar cartão, cancelar). | HU-10 / RF-012 |

### 3.3 Conta do Cliente

| # | Tela | Rota | Propósito | HU / RF |
|---|------|------|-----------|---------|
| 10 | **Meu Perfil** | `/conta` | Visualização e edição de dados pessoais e endereço. | — (suporte ao UserService) |
| 11 | **Meus Pedidos** | `/conta/pedidos` | Histórico paginado com status e link para detalhe. | HU-07 / RF-009 |
| 12 | **Detalhe do Pedido (cliente)** | `/conta/pedidos/:id` | Itens, valores, status atual, timeline (criado → pago → enviado), ação **cancelar** se status `pendente`. | HU-07, HU-08 / RF-009, RF-010 |

### 3.4 Painel Administrativo

| # | Tela | Rota | Propósito | HU / RF |
|---|------|------|-----------|---------|
| 13 | **Login Admin** | `/admin/login` | Mesmo fluxo de auth, mas validando role `admin` no token. | HU-02 / RF-002 |
| 14 | **Dashboard Admin** | `/admin` | Visão geral: pedidos do dia, alertas de estoque baixo, últimas vendas. Atalhos para gestão. | — |
| 15 | **Produtos (listagem admin)** | `/admin/produtos` | Tabela de produtos com filtros, busca e ações em linha (editar, remover). | HU-11, HU-12 / RF-013 |
| 16 | **Cadastro / Edição de Produto** | `/admin/produtos/novo` e `/admin/produtos/:id/editar` | Formulário (nome, descrição, preço, imagens, categoria, variações de tamanho). | HU-11, HU-12 / RF-013 |
| 17 | **Gestão de Estoque** | `/admin/estoque` | Por produto/variação: saldo disponível, reservado, ajuste manual com motivo. | HU-13 / RF-014 |
| 18 | **Pedidos (listagem admin)** | `/admin/pedidos` | Tabela de todos os pedidos, filtros por status/data/cliente. | HU-14 / — |
| 19 | **Detalhe do Pedido (admin)** | `/admin/pedidos/:id` | Inclui ações de **estorno** quando pagamento aprovado. | HU-15 / — |

### 3.5 Telas de Sistema (transversais)

| # | Tela | Quando aparece | Propósito |
|---|------|----------------|-----------|
| 20 | **404 — Não encontrado** | Rota inválida | Erro amigável com link para Home. |
| 21 | **Erro genérico (500)** | Falha de serviço | Feedback de indisponibilidade. Reforça RNF-005 do ponto de vista do usuário. |
| 22 | **Acesso negado (403)** | Role insuficiente | Cliente tentando rota `/admin/*`, por exemplo. |
| 23 | **Estado vazio (empty states)** | Carrinho vazio, sem pedidos, sem produtos no filtro | Não é rota — é variação contextual; listada para garantir que será projetada. |

---

## 4. Componentes Globais (compartilhados entre telas)

Não são telas, mas estruturam a navegação e devem existir desde o início:

- **Header público** — logo, busca, ícone de carrinho com contador, login/conta.
- **Header admin** — navegação lateral (produtos, estoque, pedidos), avatar do admin, logout.
- **Footer** — links institucionais, redes, política de privacidade.
- **Toast / Notificações inline** — feedback de sucesso/erro de ações.
- **Modal de confirmação** — usado em ações irreversíveis (cancelar pedido, remover produto, estornar).

---

## 5. Fluxos Principais (sequência entre telas)

### 5.1 Fluxo de compra (caminho feliz)

```
Home (01) → Catálogo (04) → Detalhe Produto (05) → Carrinho (06)
         → Login (02) [se não autenticado] → Checkout (07)
         → Confirmação (08)
```

### 5.2 Fluxo de pagamento recusado

```
Checkout (07) → Pagamento Recusado (09) → Carrinho (06) [retomar]
```

### 5.3 Fluxo de cancelamento

```
Meus Pedidos (11) → Detalhe Pedido (12) → Modal Confirmação → Detalhe Pedido (12) [status: cancelado]
```

### 5.4 Fluxo admin — cadastro de produto

```
Login Admin (13) → Dashboard (14) → Produtos (15) → Cadastro Produto (16) → Produtos (15)
```

### 5.5 Fluxo admin — estorno

```
Dashboard (14) → Pedidos Admin (18) → Detalhe Pedido Admin (19) → Modal Confirmação → Detalhe (19) [estornado]
```

---

## 6. Cobertura dos Requisitos

Verificação cruzada para garantir que toda HU/RF tem tela:

| HU / RF | Tela(s) |
|---------|---------|
| HU-01 / RF-001 | 03 |
| HU-02 / RF-002 | 02, 13 |
| HU-03 / RF-003 | 01, 04 |
| HU-04 / RF-004 | 05 |
| HU-05 / RF-005 | 06 |
| HU-06 / RF-006, 007, 008 | 07 |
| HU-07 / RF-009 | 11, 12 |
| HU-08 / RF-010 | 12 |
| HU-09 / RF-011 | 08 (gatilho), 12 (visualização) |
| HU-10 / RF-012 | 09 |
| HU-11, 12 / RF-013 | 15, 16 |
| HU-13 / RF-014 | 17 |
| HU-14 | 18, 19 |
| HU-15 | 19 |

Sem lacunas. Toda história de usuário tem ao menos uma tela responsável.

---

## 7. Decisões em Aberto (a definir antes do design visual)

1. **Identidade visual** — paleta, tipografia e tom (minimal/editorial vs. vibrante/lifestyle). Decisão impacta diretamente a percepção de "marca inclusiva".
2. **Painel admin separado ou integrado** — manter tudo em `/admin/*` no mesmo SPA (atual proposta) ou criar build separado.
3. **Recuperação de senha** — não está em HU; confirmar se entra no MVP.
4. **Wishlist / favoritos** — fora do escopo das HUs atuais. Confirmar exclusão.
5. **Reviews de produto** — fora do escopo atual. Confirmar exclusão.

---

## 8. Próximos Passos

1. Validar lista de telas com a equipe.
2. Definir identidade visual (paleta, tipografia, tom).
3. Produzir wireframes de baixa fidelidade das telas críticas (04, 05, 06, 07, 12, 16, 17).
4. Evoluir para protótipo navegável (Figma) antes de iniciar implementação React.
5. Atualizar [`frontend-web.md`](frontend-web.md) com referências aos artefatos gerados.
