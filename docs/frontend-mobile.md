# Front-end Móvel

[Inclua uma breve descrição do projeto e seus objetivos.]

## Projeto da Interface
[Descreva o projeto da interface móvel da aplicação, incluindo o design visual, layout das páginas, interações do usuário e outros aspectos relevantes.]

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

[Descreva a estratégia de teste, incluindo os tipos de teste a serem realizados (unitários, integração, carga, etc.) e as ferramentas a serem utilizadas.]

1. Crie casos de teste para cobrir todos os requisitos funcionais e não funcionais da aplicação.
2. Implemente testes unitários para testar unidades individuais de código, como funções e classes.
3. Realize testes de integração para verificar a interação correta entre os componentes da aplicação.
4. Execute testes de carga para avaliar o desempenho da aplicação sob carga significativa.
5. Utilize ferramentas de teste adequadas, como frameworks de teste e ferramentas de automação de teste, para agilizar o processo de teste.

# Referências

Inclua todas as referências (livros, artigos, sites, etc) utilizados no desenvolvimento do trabalho.

---

# Front-end Móvel — Módulo de Notificações

O módulo de notificações do front-end móvel é responsável por exibir em tempo real as notificações geradas pelos demais serviços do e-commerce (pedidos, pagamentos e estoque) diretamente no aplicativo mobile. A interface consome a mesma API REST do `NotificationService` utilizada pelo front-end web, adaptada para o contexto mobile com React Native.

---

## Projeto da Interface

O módulo é composto por dois componentes principais:

- **`NotificationBell`** — sino exibido no header do app com badge vermelho indicando notificações não lidas. Atualiza automaticamente a cada 5 segundos via polling.
- **`NotificationPage` (`index.tsx`)** — tela completa acessível via `/notification`, listando todas as notificações com suporte a pull-to-refresh e marcação como lidas.

### Wireframes

#### Tela de Notificações — `/notification`

```
┌─────────────────────────────┐
│ ← Notificações   [Marcar (N)]│
│ Atualizado às HH:MM · 5s    │
├─────────────────────────────┤
│ ┃ • Pagamento Aprovado  [success]│
│   Pedido #1234 confirmado.  │
│   31/05/2026, 15:05         │
├─────────────────────────────┤
│ ┃ • Alerta de Estoque  [warning]│
│   Item X com poucas unidades│
│   31/05/2026, 14:50         │
├─────────────────────────────┤
│ ┃   Novo Login Detectado [info]│
│   Acesso detectado na conta.│
│   31/05/2026, 14:30         │
└─────────────────────────────┘
```

Elementos da tela:
- **Header:** título "Notificações", timestamp da última atualização e botão "Marcar lidas (N)" visível apenas quando há não lidas.
- **Cards:** borda colorida à esquerda por tipo, ponto azul para não lidas, badge de tipo, mensagem e data formatada em pt-BR.
- **Pull-to-refresh:** arrastar a lista para baixo força atualização imediata.
- **Estado vazio:** mensagem "Nenhuma notificação encontrada." centralizada.
- **Estado de erro:** banner vermelho quando o backend está inacessível.

#### Sino no Menu — `ServicesDrawer`

```
┌─────────────────┐
│ INSIDER      ✕  │
│ [Avatar] Nome   │
│         email   │
├─────────────────┤
│ Minha Conta     │
│ 👤 Meu Perfil  ›│
│ 🔔 Notificações›│  ← adicionado
│ 🛒 Carrinho    ›│
├─────────────────┤
│ Catálogo        │
│ 🏷️ Categorias  ›│
└─────────────────┘
```

---

### Design Visual

| Item | Definição |
|---|---|
| Fundo da tela | `#000000` (preto) |
| Cards | `#111827` com borda `#1f2937` |
| Borda esquerda success | `#22c55e` (verde) |
| Borda esquerda warning | `#f59e0b` (amarelo) |
| Borda esquerda error | `#ef4444` (vermelho) |
| Borda esquerda info | `#3b82f6` (azul) |
| Texto principal | `#ffffff` |
| Texto secundário | `#9ca3af` |
| Texto terciário | `#4b5563` |
| Badge não lida | ponto `#3b82f6` |
| Badge tipo | fundo escuro com texto colorido por tipo |
| Notificação lida | opacidade 60% |
| Badge sino | vermelho `red` com texto branco |

Estilos aplicados via StyleSheet inline do React Native, sem biblioteca de componentes de UI — padrão do projeto.

---

## Fluxo de Dados

```
Backend (NotificationService :5000)
        │
        │  GET /api/notifications        (polling 5s)
        │  GET /api/notifications/unread-count  (polling 5s)
        │  PUT /api/notifications/mark-all-read
        ▼
App Mobile (React Native / Expo)
        │
        ├─► NotificationBell   → badge no menu
        └─► NotificationPage   → lista completa em /notification
```

**Como funciona:**
1. O `NotificationBell` faz polling a cada 5s em `GET /unread-count` e atualiza o badge.
2. Ao entrar em `/notification`, o `NotificationPage` busca todas as notificações e inicia polling de 5s.
3. O botão "Marcar lidas" chama `PUT /mark-all-read` e atualiza o estado local sem refetch.
4. Pull-to-refresh força busca imediata.

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.76+ | Framework mobile |
| Expo | ~54.0 | Toolchain e runtime |
| expo-router | ~6.0 | Roteamento por sistema de arquivos |
| TypeScript | 5+ | Tipagem estática |
| Fetch API nativa | — | Chamadas HTTP ao backend |

---

## Considerações de Segurança

| Tópico | Estado atual |
|---|---|
| Autenticação | Endpoints públicos — sem autenticação aplicada no módulo de notificações |
| Transporte | HTTP local em desenvolvimento; HTTPS obrigatório em produção |
| Dados sensíveis | Notificações não contêm dados financeiros ou senhas |
| Token | O `NotificationService` não exige JWT atualmente; recomendado para produção |

**Recomendação para produção:** filtrar notificações por usuário autenticado, exigindo JWT nos endpoints `/api/notifications`.

---

## Implantação

A aplicação mobile roda via Expo em ambiente local. Implantação em produção (APK/IPA) ainda não foi configurada e está fora do escopo desta etapa.

**Execução local:**

1. Pré-requisitos: Node.js 20+, Expo CLI e Docker Desktop instalados.
2. Subir o banco e o backend de notificações:
   ```powershell
   docker start postgres_notif
   cd src/services/notification
   dotnet run
   ```
3. Subir o app mobile:
   ```powershell
   cd src/mobile
   npx expo start
   ```
4. Pressionar **W** para abrir no navegador ou escanear o QR Code com o **Expo Go** no celular.
5. Navegar via **Menu → Notificações**.

---

## Testes

### Estratégia

Testes funcionais manuais executados em ambiente local, cobrindo as interações do **módulo de Notificações** no front-end móvel. Validações de entrada, autenticação, performance e automação estão fora do escopo desta etapa.

---

### Mapeamento de interações

| ID | Interação | Componente | API back-end |
|---|---|---|---|
| M-I1 | Listar notificações | `notification/index.tsx` | `GET /api/notifications` |
| M-I2 | Atualização automática (polling) | `notification/index.tsx` | `GET /api/notifications` |
| M-I3 | Pull-to-refresh | `notification/index.tsx` | `GET /api/notifications` |
| M-I4 | Marcar todas como lidas | `notification/index.tsx` | `PUT /api/notifications/mark-all-read` |
| M-I5 | Badge de não lidas | `NotificationBell.tsx` | `GET /api/notifications/unread-count` |
| M-I6 | Navegar para notificações | `ServicesDrawer.tsx` | — |

---

### Casos de teste

#### Notificações Mobile — M-I1: Listagem

##### TC-M-I1-01 · Carregar lista de notificações

- **Pré-condições:**
  - Backend ativo em `http://localhost:5000`.
  - Ao menos uma notificação registrada no banco.
- **Passos:**
  1. Abrir o app e navegar para **Menu → Notificações**.
- **Resultado esperado:**
  - Tela exibe cards com título, mensagem, tipo e data formatada em pt-BR.
  - Cards não lidos exibem ponto azul e opacidade plena.
  - Cards lidos exibem opacidade reduzida (60%).
  - Borda esquerda colorida por tipo (verde/amarelo/azul/vermelho).

---

##### TC-M-I1-02 · Estado vazio

- **Pré-condições:**
  - Banco sem notificações.
- **Passos:**
  1. Navegar para **Menu → Notificações**.
- **Resultado esperado:**
  - Mensagem "Nenhuma notificação encontrada." exibida centralizada.

---

##### TC-M-I1-03 · Estado com backend indisponível

- **Pré-condições:**
  - Backend parado.
- **Passos:**
  1. Navegar para **Menu → Notificações**.
- **Resultado esperado:**
  - Banner de erro exibido: `⚠ Sem conexão com o servidor. Tentando reconectar...`
  - Notificações anteriores permanecem visíveis se já estavam carregadas.

---

#### Notificações Mobile — M-I2: Polling automático

##### TC-M-I2-01 · Nova notificação aparece sem recarregar

- **Pré-condições:**
  - Tela `/notification` aberta.
  - Backend ativo.
- **Passos:**
  1. Sem fechar a tela, disparar evento via terminal:
     ```powershell
     Invoke-WebRequest -Uri http://localhost:5000/api/demo/payment -Method Post
     ```
  2. Aguardar até 5 segundos.
- **Resultado esperado:**
  - Novo card aparece automaticamente no topo da lista.
  - Timestamp "Atualizado às HH:MM:SS" é atualizado.

---

#### Notificações Mobile — M-I3: Pull-to-refresh

##### TC-M-I3-01 · Atualizar lista manualmente

- **Pré-condições:**
  - Tela de notificações aberta.
- **Passos:**
  1. Arrastar a lista para baixo (gesto de pull-to-refresh).
- **Resultado esperado:**
  - Indicador de carregamento exibido brevemente.
  - Lista atualizada com dados mais recentes do backend.

---

#### Notificações Mobile — M-I4: Marcar como lidas

##### TC-M-I4-01 · Marcar todas como lidas

- **Pré-condições:**
  - Ao menos uma notificação não lida na lista.
- **Passos:**
  1. Verificar que o botão `Marcar lidas (N)` está visível no topo.
  2. Tocar no botão.
- **Resultado esperado:**
  - Todos os cards perdem o ponto azul e ficam com opacidade reduzida.
  - Botão "Marcar lidas" desaparece.
  - Badge do sino é zerado.

---

#### Notificações Mobile — M-I5: Badge

##### TC-M-I5-01 · Badge exibido com notificações não lidas

- **Pré-condições:**
  - Ao menos uma notificação não lida no banco.
- **Passos:**
  1. Observar o ícone 🔔 no menu.
- **Resultado esperado:**
  - Badge vermelho exibe o número de não lidas.
  - Atualiza automaticamente a cada 5 segundos.

##### TC-M-I5-02 · Badge ausente sem não lidas

- **Pré-condições:**
  - Todas as notificações marcadas como lidas.
- **Passos:**
  1. Observar o ícone 🔔 no menu.
- **Resultado esperado:**
  - Badge vermelho não é exibido.

---

#### Notificações Mobile — M-I6: Navegação

##### TC-M-I6-01 · Acessar notificações pelo menu

- **Pré-condições:**
  - App aberto em qualquer tela.
- **Passos:**
  1. Tocar em **Menu** na barra inferior.
  2. Tocar em **🔔 Notificações**.
- **Resultado esperado:**
  - App navega para a tela `/notification`.
  - Header exibe título "Notificações".
  - Lista é carregada corretamente.

---

### Fluxo de validação funcional

```powershell
# 1. Subir banco e backend
docker start postgres_notif
cd src/services/notification && dotnet run

# 2. Disparar eventos de teste
Invoke-WebRequest -Uri http://localhost:5000/api/demo/login   -Method Post
Invoke-WebRequest -Uri http://localhost:5000/api/demo/order   -Method Post
Invoke-WebRequest -Uri http://localhost:5000/api/demo/payment -Method Post
Invoke-WebRequest -Uri http://localhost:5000/api/demo/stock   -Method Post

# 3. Abrir o app
cd src/mobile && npx expo start
# Pressionar W → Menu → Notificações
```

---

## Referências

- [Expo Router — File-based routing](https://expo.github.io/router/docs)
- [React Native — Documentação oficial](https://reactnative.dev/docs/getting-started)
- `src/mobile/app/notification/index.tsx`
- `src/mobile/app/notification/NotificationBell.tsx`
- `src/mobile/src/components/ServicesDrawer.tsx`
- `src/mobile/app/_layout.tsx`
- `src/services/notification/Program.cs`
# Front-end Móvel — Módulo de Notificações

O módulo de notificações do front-end móvel é responsável por exibir em tempo real as notificações geradas pelos demais serviços do e-commerce (pedidos, pagamentos e estoque) diretamente no aplicativo mobile. A interface consome a mesma API REST do `NotificationService` utilizada pelo front-end web, adaptada para o contexto mobile com React Native.

---

## Projeto da Interface

O módulo é composto por dois componentes principais:

- **`NotificationBell`** — sino exibido no header do app com badge vermelho indicando notificações não lidas. Atualiza automaticamente a cada 5 segundos via polling.
- **`NotificationPage` (`index.tsx`)** — tela completa acessível via `/notification`, listando todas as notificações com suporte a pull-to-refresh e marcação como lidas.

### Wireframes

#### Tela de Notificações — `/notification`

```
┌─────────────────────────────┐
│ ← Notificações   [Marcar (N)]│
│ Atualizado às HH:MM · 5s    │
├─────────────────────────────┤
│ ┃ • Pagamento Aprovado  [success]│
│   Pedido #1234 confirmado.  │
│   31/05/2026, 15:05         │
├─────────────────────────────┤
│ ┃ • Alerta de Estoque  [warning]│
│   Item X com poucas unidades│
│   31/05/2026, 14:50         │
├─────────────────────────────┤
│ ┃   Novo Login Detectado [info]│
│   Acesso detectado na conta.│
│   31/05/2026, 14:30         │
└─────────────────────────────┘
```

Elementos da tela:
- **Header:** título "Notificações", timestamp da última atualização e botão "Marcar lidas (N)" visível apenas quando há não lidas.
- **Cards:** borda colorida à esquerda por tipo, ponto azul para não lidas, badge de tipo, mensagem e data formatada em pt-BR.
- **Pull-to-refresh:** arrastar a lista para baixo força atualização imediata.
- **Estado vazio:** mensagem "Nenhuma notificação encontrada." centralizada.
- **Estado de erro:** banner vermelho quando o backend está inacessível.

#### Sino no Menu — `ServicesDrawer`

```
┌─────────────────┐
│ INSIDER      ✕  │
│ [Avatar] Nome   │
│         email   │
├─────────────────┤
│ Minha Conta     │
│ 👤 Meu Perfil  ›│
│ 🔔 Notificações›│  ← adicionado
│ 🛒 Carrinho    ›│
├─────────────────┤
│ Catálogo        │
│ 🏷️ Categorias  ›│
└─────────────────┘
```

---

### Design Visual

| Item | Definição |
|---|---|
| Fundo da tela | `#000000` (preto) |
| Cards | `#111827` com borda `#1f2937` |
| Borda esquerda success | `#22c55e` (verde) |
| Borda esquerda warning | `#f59e0b` (amarelo) |
| Borda esquerda error | `#ef4444` (vermelho) |
| Borda esquerda info | `#3b82f6` (azul) |
| Texto principal | `#ffffff` |
| Texto secundário | `#9ca3af` |
| Texto terciário | `#4b5563` |
| Badge não lida | ponto `#3b82f6` |
| Badge tipo | fundo escuro com texto colorido por tipo |
| Notificação lida | opacidade 60% |
| Badge sino | vermelho `red` com texto branco |

Estilos aplicados via StyleSheet inline do React Native, sem biblioteca de componentes de UI — padrão do projeto.

---

## Fluxo de Dados

```
Backend (NotificationService :5000)
        │
        │  GET /api/notifications        (polling 5s)
        │  GET /api/notifications/unread-count  (polling 5s)
        │  PUT /api/notifications/mark-all-read
        ▼
App Mobile (React Native / Expo)
        │
        ├─► NotificationBell   → badge no menu
        └─► NotificationPage   → lista completa em /notification
```

**Como funciona:**
1. O `NotificationBell` faz polling a cada 5s em `GET /unread-count` e atualiza o badge.
2. Ao entrar em `/notification`, o `NotificationPage` busca todas as notificações e inicia polling de 5s.
3. O botão "Marcar lidas" chama `PUT /mark-all-read` e atualiza o estado local sem refetch.
4. Pull-to-refresh força busca imediata.

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|---|---|---|
| React Native | 0.76+ | Framework mobile |
| Expo | ~54.0 | Toolchain e runtime |
| expo-router | ~6.0 | Roteamento por sistema de arquivos |
| TypeScript | 5+ | Tipagem estática |
| Fetch API nativa | — | Chamadas HTTP ao backend |

---

## Considerações de Segurança

| Tópico | Estado atual |
|---|---|
| Autenticação | Endpoints públicos — sem autenticação aplicada no módulo de notificações |
| Transporte | HTTP local em desenvolvimento; HTTPS obrigatório em produção |
| Dados sensíveis | Notificações não contêm dados financeiros ou senhas |
| Token | O `NotificationService` não exige JWT atualmente; recomendado para produção |

**Recomendação para produção:** filtrar notificações por usuário autenticado, exigindo JWT nos endpoints `/api/notifications`.

---

## Implantação

A aplicação mobile roda via Expo em ambiente local. Implantação em produção (APK/IPA) ainda não foi configurada e está fora do escopo desta etapa.

**Execução local:**

1. Pré-requisitos: Node.js 20+, Expo CLI e Docker Desktop instalados.
2. Subir o banco e o backend de notificações:
   ```powershell
   docker start postgres_notif
   cd src/services/notification
   dotnet run
   ```
3. Subir o app mobile:
   ```powershell
   cd src/mobile
   npx expo start
   ```
4. Pressionar **W** para abrir no navegador ou escanear o QR Code com o **Expo Go** no celular.
5. Navegar via **Menu → Notificações**.

---

## Testes

### Estratégia

Testes funcionais manuais executados em ambiente local, cobrindo as interações do **módulo de Notificações** no front-end móvel. Validações de entrada, autenticação, performance e automação estão fora do escopo desta etapa.

---

### Mapeamento de interações

| ID | Interação | Componente | API back-end |
|---|---|---|---|
| M-I1 | Listar notificações | `notification/index.tsx` | `GET /api/notifications` |
| M-I2 | Atualização automática (polling) | `notification/index.tsx` | `GET /api/notifications` |
| M-I3 | Pull-to-refresh | `notification/index.tsx` | `GET /api/notifications` |
| M-I4 | Marcar todas como lidas | `notification/index.tsx` | `PUT /api/notifications/mark-all-read` |
| M-I5 | Badge de não lidas | `NotificationBell.tsx` | `GET /api/notifications/unread-count` |
| M-I6 | Navegar para notificações | `ServicesDrawer.tsx` | — |

---

### Casos de teste

#### Notificações Mobile — M-I1: Listagem

##### TC-M-I1-01 · Carregar lista de notificações

- **Pré-condições:**
  - Backend ativo em `http://localhost:5000`.
  - Ao menos uma notificação registrada no banco.
- **Passos:**
  1. Abrir o app e navegar para **Menu → Notificações**.
- **Resultado esperado:**
  - Tela exibe cards com título, mensagem, tipo e data formatada em pt-BR.
  - Cards não lidos exibem ponto azul e opacidade plena.
  - Cards lidos exibem opacidade reduzida (60%).
  - Borda esquerda colorida por tipo (verde/amarelo/azul/vermelho).

---

##### TC-M-I1-02 · Estado vazio

- **Pré-condições:**
  - Banco sem notificações.
- **Passos:**
  1. Navegar para **Menu → Notificações**.
- **Resultado esperado:**
  - Mensagem "Nenhuma notificação encontrada." exibida centralizada.

---

##### TC-M-I1-03 · Estado com backend indisponível

- **Pré-condições:**
  - Backend parado.
- **Passos:**
  1. Navegar para **Menu → Notificações**.
- **Resultado esperado:**
  - Banner de erro exibido: `⚠ Sem conexão com o servidor. Tentando reconectar...`
  - Notificações anteriores permanecem visíveis se já estavam carregadas.

---

#### Notificações Mobile — M-I2: Polling automático

##### TC-M-I2-01 · Nova notificação aparece sem recarregar

- **Pré-condições:**
  - Tela `/notification` aberta.
  - Backend ativo.
- **Passos:**
  1. Sem fechar a tela, disparar evento via terminal:
     ```powershell
     Invoke-WebRequest -Uri http://localhost:5000/api/demo/payment -Method Post
     ```
  2. Aguardar até 5 segundos.
- **Resultado esperado:**
  - Novo card aparece automaticamente no topo da lista.
  - Timestamp "Atualizado às HH:MM:SS" é atualizado.

---

#### Notificações Mobile — M-I3: Pull-to-refresh

##### TC-M-I3-01 · Atualizar lista manualmente

- **Pré-condições:**
  - Tela de notificações aberta.
- **Passos:**
  1. Arrastar a lista para baixo (gesto de pull-to-refresh).
- **Resultado esperado:**
  - Indicador de carregamento exibido brevemente.
  - Lista atualizada com dados mais recentes do backend.

---

#### Notificações Mobile — M-I4: Marcar como lidas

##### TC-M-I4-01 · Marcar todas como lidas

- **Pré-condições:**
  - Ao menos uma notificação não lida na lista.
- **Passos:**
  1. Verificar que o botão `Marcar lidas (N)` está visível no topo.
  2. Tocar no botão.
- **Resultado esperado:**
  - Todos os cards perdem o ponto azul e ficam com opacidade reduzida.
  - Botão "Marcar lidas" desaparece.
  - Badge do sino é zerado.

---

#### Notificações Mobile — M-I5: Badge

##### TC-M-I5-01 · Badge exibido com notificações não lidas

- **Pré-condições:**
  - Ao menos uma notificação não lida no banco.
- **Passos:**
  1. Observar o ícone 🔔 no menu.
- **Resultado esperado:**
  - Badge vermelho exibe o número de não lidas.
  - Atualiza automaticamente a cada 5 segundos.

##### TC-M-I5-02 · Badge ausente sem não lidas

- **Pré-condições:**
  - Todas as notificações marcadas como lidas.
- **Passos:**
  1. Observar o ícone 🔔 no menu.
- **Resultado esperado:**
  - Badge vermelho não é exibido.

---

#### Notificações Mobile — M-I6: Navegação

##### TC-M-I6-01 · Acessar notificações pelo menu

- **Pré-condições:**
  - App aberto em qualquer tela.
- **Passos:**
  1. Tocar em **Menu** na barra inferior.
  2. Tocar em **🔔 Notificações**.
- **Resultado esperado:**
  - App navega para a tela `/notification`.
  - Header exibe título "Notificações".
  - Lista é carregada corretamente.

---

### Fluxo de validação funcional

```powershell
# 1. Subir banco e backend
docker start postgres_notif
cd src/services/notification && dotnet run

# 2. Disparar eventos de teste
Invoke-WebRequest -Uri http://localhost:5000/api/demo/login   -Method Post
Invoke-WebRequest -Uri http://localhost:5000/api/demo/order   -Method Post
Invoke-WebRequest -Uri http://localhost:5000/api/demo/payment -Method Post
Invoke-WebRequest -Uri http://localhost:5000/api/demo/stock   -Method Post

# 3. Abrir o app
cd src/mobile && npx expo start
# Pressionar W → Menu → Notificações
```

---

## Referências

- [Expo Router — File-based routing](https://expo.github.io/router/docs)
- [React Native — Documentação oficial](https://reactnative.dev/docs/getting-started)
- `src/mobile/app/notification/index.tsx`
- `src/mobile/app/notification/NotificationBell.tsx`
- `src/mobile/src/components/ServicesDrawer.tsx`
- `src/mobile/app/_layout.tsx`
- `src/services/notification/Program.cs`
