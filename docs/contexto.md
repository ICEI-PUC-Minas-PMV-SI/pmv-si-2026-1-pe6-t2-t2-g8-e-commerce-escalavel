# Introdução

Este projeto aborda o desenvolvimento de uma loja virtual de roupas voltada ao público em geral com foco na oferta de peças em diferentes tamanhos, incluindo numerações plus size. A proposta surge a partir da percepção de que, no comércio online de moda, muitos consumidores ainda enfrentam dificuldades para encontrar roupas adequadas ao seu corpo, o que torna a experiência de compra mais limitada e pouco inclusiva. Nesse contexto, o problema identificado está na dificuldade de atender de forma acessível e organizada pessoas com diferentes perfis e necessidades de vestimenta dentro de um ambiente digital. 

Diante disso, o objetivo do projeto é estruturar uma solução capaz de contribuir para uma experiência de compra mais inclusiva, considerando a diversidade de tamanhos e a necessidade de atender melhor o público. A justificativa para o desenvolvimento desse projeto está na importância de ampliar a acessibilidade no setor de moda online, reduzindo barreiras que ainda afetam parte dos consumidores e promovendo uma relação mais eficiente entre loja e cliente. Assim, o público-alvo do projeto é formado por consumidores em geral que buscam comprar roupas pela internet, especialmente aqueles que valorizam maior variedade de tamanhos e mais facilidade para encontrar peças adequadas. 

## Problema
No comércio online de roupas, ainda é comum que muitos consumidores tenham dificuldade para encontrar peças no tamanho que precisam. Mesmo lojas que atendem ao público em geral nem sempre oferecem uma variedade de numerações que inclua de forma adequada pessoas que vestem tamanhos maiores, como no caso do público plus size. Isso acaba tornando a experiência de compra mais limitada, já que o cliente pode se interessar por um produto, mas não encontrar uma opção que atenda ao seu corpo. Dessa forma, o problema está na dificuldade de oferecer, em uma loja virtual de roupas, opções de tamanhos mais inclusivas e acessíveis para diferentes perfis de clientes. 

## Objetivos

Objetivo geral

Temos como objetivo geral desenvolver um sistema de e-commerce escalável e distribuído, visando solucionar as limitações de infraestrutura e disponibilidade apresentadas anteriormente, garantindo uma plataforma de alta performance capaz de suportar grandes volumes de acessos simultâneos com estabilidade e segurança.

Objetivos específicos

- Otimizar o desempenho e o tempo de resposta: Implementar técnicas de arquitetura que proporcionem uma experiência de navegação fluida, intuitiva e de baixa latência para o usuário final.

- Implementar funcionalidades essenciais de operação: Construir os módulos fundamentais de navegação, cadastro de clientes, listagem dinâmica de produtos e gerenciamento de pedidos, garantindo a integridade do ciclo de uso.

## Justificativa

O avanço contínuo do comércio eletrônico expôs um desafio técnico crítico: a necessidade de plataformas capazes de escalar sob demanda sem perder performance. Arquiteturas monolíticas tradicionais frequentemente apresentam gargalos de lentidão e indisponibilidade em cenários de alto tráfego. A motivação central deste projeto nasce da necessidade de superar essas limitações estruturais, aplicando na prática conceitos de alta disponibilidade e resiliência.

Para solucionar esse problema, o projeto propõe o desenvolvimento de um sistema de e-commerce escalável e distribuído, estruturado em microsserviços. A aplicação orquestra todo o fluxo de compras — desde a exibição do catálogo e reserva de estoque até o pagamento e notificação — utilizando mensageria assíncrona (RabbitMQ) e roteamento eficiente (API Gateway) para garantir um tempo de resposta máximo de 3 segundos.

A plataforma é direcionada a dois perfis principais: consumidores finais (B2C), que exigem uma experiência de navegação mobile rápida e sem interrupções para finalizar suas compras, e lojistas/administradores (B2B), que dependem de dados consistentes e em tempo real para a gestão de estoque e pedidos.

O desenvolvimento deste trabalho apoia-se nos fundamentos acadêmicos voltados para a tecnologia em banco de dados e arquitetura de sistemas, focando especialmente no isolamento lógico de dados (PostgreSQL) para microsserviços. Além disso, fundamenta-se nas melhores práticas de mercado e documentações oficiais das tecnologias adotadas (Docker, React, .NET e Node.js), bem como na premissa estatística do comércio digital de que a baixa latência e a estabilidade da infraestrutura estão diretamente correlacionadas com a retenção de usuários e a conversão de vendas.

## Público-Alvo

O ecossistema desta plataforma de e-commerce é projetado para atender a dois espectros distintos de usuários, cujas necessidades justificam a escolha por uma arquitetura distribuída e de alta disponibilidade. A complexidade do processamento em microsserviços e da mensageria assíncrona atua nos bastidores para atender às demandas de performance do consumidor e às exigências de consistência de dados da gestão.

### 1. Descrição Textual dos Perfis e Personas

**Perfil A: Consumidor Final (B2C)**
São os usuários que interagem exclusivamente com o frontend (React). Buscam conveniência, fluidez e segurança ao realizar compras. 
* **Relação com a tecnologia:** Variada, indo do básico ao avançado, com predominância do uso de dispositivos móveis.
* **Comportamento esperado:** Baixa tolerância a falhas ou lentidão. A exigência desse grupo dita o requisito não funcional de tempo de resposta inferior a 3 segundos.
* **Persona de Referência (Lucas Andrade, 24 anos):** Estudante universitário que faz compras por impulso ou conveniência pelo smartphone entre uma atividade e outra. Abandona o carrinho caso a página demore a carregar ou o processamento do pagamento não forneça feedback imediato.

**Perfil B: Lojista e Administrador de Operações (B2B)**
Composto pelos profissionais de backoffice que gerenciam o catálogo de produtos, controlam o estoque e monitoram o fluxo de pedidos.
* **Relação com a tecnologia:** Intermediária a avançada. Possuem familiaridade com painéis administrativos e sistemas de gestão corporativa.
* **Comportamento esperado:** Necessitam de dados íntegros e em tempo real. A exigência desse grupo valida a arquitetura de bancos de dados isolados (PostgreSQL) por serviço e a orquestração via RabbitMQ, evitando que uma falha no serviço de pagamento, por exemplo, corrompa o inventário.
* **Persona de Referência (Mariana Ribas, 41 anos):** Gerente de operações comerciais. Acessa o sistema majoritariamente via desktop. Sua principal dor é a discrepância entre o estoque virtual e o físico; logo, precisa confiar que os dados refletidos no painel são exatos e atualizados em tempo real.

### 2. Mapa de Stakeholders

O projeto também envolve partes interessadas acadêmicas e técnicas, cujo envolvimento dita os critérios de sucesso e a infraestrutura de hospedagem da aplicação.

| Stakeholder | Categoria | Nível de Influência | Interesses Principais no Projeto |
| :--- | :--- | :--- | :--- |
| **Professores e Avaliadores** | Interno (Acadêmico) | Alto | Comprovação prática da estruturação de microsserviços, modelagem correta e isolamento lógico no banco de dados, e hospedagem bem-sucedida na rede institucional. |
| **Equipe de Desenvolvimento** | Interno (Técnico) | Alto | Entrega do MVP no prazo estipulado, aplicação de tecnologias modernas (.NET, Node.js, Docker) e versionamento eficiente. |
| **Administradores / Lojistas** | Externo (Simulado) | Alto | Plataforma estável, segurança no tráfego de dados e consistência transacional entre estoque e pedidos. |
| **Consumidores Finais** | Externo (Simulado) | Médio | Interface responsiva, clareza nas notificações de status de compra e latência mínima. |

# Especificação do Projeto

Esta seção apresenta a especificação detalhada do projeto de e-commerce distribuído, incluindo as histórias de usuário que fundamentaram os requisitos, os requisitos funcionais e não funcionais levantados, a técnica de priorização aplicada e as restrições identificadas para o desenvolvimento da solução.

---

# Histórias de Usuário

As histórias de usuário foram elaboradas a partir das perspectivas dos dois perfis de usuário identificados: o cliente final e o administrador da loja. Elas descrevem as necessidades e expectativas de cada perfil de forma objetiva e orientada ao valor entregue.

## Perfil: Cliente

| ID | História de Usuário |
|----|---------------------|
| HU-01 | Como cliente, quero me cadastrar na plataforma informando nome, e-mail e senha, para ter acesso às funcionalidades de compra. |
| HU-02 | Como cliente, quero fazer login com meu e-mail e senha, para acessar minha conta com segurança. |
| HU-03 | Como cliente, quero visualizar o catálogo de produtos com filtros por categoria, nome e faixa de preço, para encontrar o que procuro com facilidade. |
| HU-04 | Como cliente, quero visualizar os detalhes de um produto (nome, descrição, preço e imagem), para tomar uma decisão de compra informada. |
| HU-05 | Como cliente, quero adicionar produtos a um carrinho antes de finalizar a compra, para organizar minha seleção. |
| HU-06 | Como cliente, quero finalizar um pedido com os itens do meu carrinho, para realizar a compra. |
| HU-07 | Como cliente, quero acompanhar o status dos meus pedidos, para saber em que etapa minha compra se encontra. |
| HU-08 | Como cliente, quero cancelar um pedido ainda pendente, para desistir de uma compra quando necessário. |
| HU-09 | Como cliente, quero receber uma notificação por e-mail ao confirmar meu pedido, para ter a comprovação da compra. |
| HU-10 | Como cliente, quero ser notificado caso meu pagamento seja recusado, para poder tomar uma ação alternativa. |

## Perfil: Administrador

| ID | História de Usuário |
|----|---------------------|
| HU-11 | Como administrador, quero cadastrar novos produtos com nome, descrição, preço e imagem, para manter o catálogo atualizado. |
| HU-12 | Como administrador, quero editar e remover produtos do catálogo, para manter as informações precisas. |
| HU-13 | Como administrador, quero gerenciar o estoque de cada produto, para evitar vendas de itens indisponíveis. |
| HU-14 | Como administrador, quero visualizar todos os pedidos realizados na plataforma, para monitorar as operações da loja. |
| HU-15 | Como administrador, quero solicitar o estorno de um pagamento aprovado, para tratar situações de reembolso. |

---

# Técnica de Priorização de Requisitos

Para a priorização dos requisitos, foi utilizada a técnica MoSCoW, amplamente adotada em projetos ágeis e de desenvolvimento de software. A técnica classifica os requisitos em quatro categorias:

| Categoria | Significado |
|----------|-------------|
| Must Have (ALTA) | Requisito essencial — sem ele o sistema não funciona ou não entrega valor mínimo. |
| Should Have (MÉDIA) | Requisito importante — agrega valor significativo mas pode ser entregue em iteração posterior. |
| Could Have (BAIXA) | Requisito desejável — melhora a experiência mas tem impacto mínimo se ausente. |
| Won't Have | Requisito fora do escopo desta entrega — pode ser considerado em versões futuras. |

A classificação foi feita com base no impacto de cada requisito no fluxo principal da plataforma — o ciclo completo de compra: cadastro, navegação, pedido, pagamento e notificação. Requisitos que bloqueiam esse fluxo foram classificados como ALTA. Requisitos que melhoram a experiência ou a operação foram classificados como MÉDIA ou BAIXA.

---

# Requisitos Funcionais

Os requisitos funcionais descrevem as funcionalidades que a plataforma deve oferecer para atender às histórias de usuário levantadas.

| ID | Descrição | HU Relacionada | Prioridade |
|----|-----------|---------------|-----------|
| RF-001 | O sistema deve permitir o cadastro de novos usuários com nome, e-mail e senha. | HU-01 | ALTA |
| RF-002 | O sistema deve autenticar usuários via e-mail e senha, retornando um token JWT. | HU-02 | ALTA |
| RF-003 | O sistema deve permitir a listagem de produtos com filtros por categoria, nome e faixa de preço. | HU-03 | ALTA |
| RF-004 | O sistema deve exibir os detalhes de um produto específico. | HU-04 | ALTA |
| RF-005 | O sistema deve permitir que o usuário monte um carrinho de compras antes de finalizar o pedido. | HU-05 | ALTA |
| RF-006 | O sistema deve permitir que usuários autenticados criem pedidos a partir do carrinho. | HU-06 | ALTA |
| RF-007 | O sistema deve verificar a disponibilidade de estoque ao criar um pedido. | HU-06 | ALTA |
| RF-008 | O sistema deve processar o pagamento do pedido e retornar o resultado da transação. | HU-06 | ALTA |
| RF-009 | O sistema deve permitir que o usuário consulte o status e histórico dos seus pedidos. | HU-07 | ALTA |
| RF-010 | O sistema deve permitir o cancelamento de pedidos com status pendente. | HU-08 | ALTA |
| RF-011 | O sistema deve enviar notificação ao usuário ao confirmar um pedido. | HU-09 | ALTA |
| RF-012 | O sistema deve notificar o usuário em caso de pagamento recusado. | HU-10 | ALTA |
| RF-013 | O sistema deve permitir que administradores cadastrem, editem e removam produtos. | HU-11, HU-12 | ALTA |
| RF-014 | O sistema deve permitir que administradores gerenciem o estoque de cada produto. | HU-13 | ALTA |

---

# Requisitos Não Funcionais

Os requisitos não funcionais descrevem as características técnicas e de qualidade que a plataforma deve atender, independentemente das funcionalidades específicas.

| ID | Descrição | Categoria | Prioridade |
|----|-----------|----------|-----------|
| RNF-001 | Cada serviço deve responder a requisições em até 500ms em condições normais de carga. | Desempenho | ALTA |
| RNF-002 | Todas as rotas protegidas devem exigir autenticação via token JWT. | Segurança | ALTA |
| RNF-003 | As senhas dos usuários devem ser armazenadas com hash BCrypt, nunca em texto puro. | Segurança | ALTA |
| RNF-004 | A comunicação entre serviços deve ser feita exclusivamente via API Gateway, nunca por chamadas diretas do frontend. | Segurança | ALTA |
| RNF-005 | A falha de um serviço não deve causar indisponibilidade dos demais serviços. | Disponibilidade | ALTA |
| RNF-006 | O sistema deve ser executável em qualquer ambiente com Docker instalado. | Portabilidade | ALTA |
| RNF-007 | A comunicação entre serviços deve seguir o padrão REST com payloads em JSON. | Interoperabilidade | ALTA |
| RNF-008 | O NotificationService deve processar eventos de forma assíncrona, sem bloquear o fluxo principal de pedidos. | Desempenho | ALTA |
| RNF-009 | Cada serviço deve ter sua própria base de código, Dockerfile e documentação de API (Swagger). | Manutenibilidade | MÉDIA |
| RNF-010 | O banco de dados deve ser organizado com schemas separados por domínio de serviço. | Manutenibilidade | MÉDIA |
| RNF-011 | Os serviços devem ser containerizados e passíveis de escalabilidade horizontal independente. | Escalabilidade | MÉDIA |
| RNF-012 | O sistema deve expor apenas o API Gateway para o cliente; as portas internas dos serviços não devem ser acessíveis em produção. | Segurança | MÉDIA |
| RNF-013 | Variáveis sensíveis (senhas, chaves JWT) devem ser configuradas via variáveis de ambiente, nunca hardcoded. | Segurança | MÉDIA |
| RNF-014 | O frontend deve ser responsivo e funcionar em dispositivos móveis e desktop. | Usabilidade | BAIXA |

---

# Restrições

As restrições definem as limitações que condicionam o desenvolvimento e a entrega da solução, independentemente das decisões técnicas da equipe.

| ID | Restrição |
|----|----------|
| R-01 | O projeto deverá ser entregue até o final do semestre letivo vigente, conforme cronograma definido pela instituição. |
| R-02 | O sistema será executado localmente via Docker Compose, sem obrigatoriedade de ambiente de produção real. |
| R-03 | O gateway de pagamento será simulado, sem integração com provedores financeiros reais. |
| R-04 | Serão utilizadas apenas ferramentas e tecnologias de código aberto ou com licença gratuita para fins acadêmicos. |
| R-05 | A arquitetura deve seguir o modelo SOA (Service-Oriented Architecture), com serviços independentes comunicando-se via REST e mensageria. |
| R-06 | Cada serviço deverá ser desenvolvido e mantido por no máximo dois integrantes da equipe. |
| R-07 | Não será implementado um sistema de autenticação multifator (MFA) nesta versão. |

# Catálogo de Serviços

## Visão Geral

| Serviço | Tecnologia | Tipo | Porta |
|--------|------------|------|------|
| UserService | A definir | API REST | 5001 |
| CatalogService |  | API REST | 5002 |
| StockService |  | API REST | 5003 |
| OrderService |  | API REST | 5004 |
| PaymentService |  | API REST | 5005 |
| NotificationService |  | Worker | — |

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
| POST | /stock/{productId} | Define estoque inicial | Admin |
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

---

# Arquitetura da Solução

## Visao Geral

<li><a href="img/ecom-arq.png"> Diagrama Arq</a></li>

A plataforma adota a Arquitetura Orientada a Serviços (SOA), na qual as funcionalidades do sistema são decompostas em serviços autônomos e coesos. Cada serviço é responsável por um domínio específico de negócio, possui sua própria lógica de aplicação e expõe uma API REST para comunicação com os demais.

Um API Gateway (Nginx) atua como ponto de entrada único para todos os clientes, sendo responsável pelo roteamento das requisições ao serviço correspondente e pela validação do token JWT. O banco de dados PostgreSQL é compartilhado, porém organizado em schemas distintos por domínio, garantindo isolamento lógico sem a complexidade operacional de múltiplos bancos.

Para o fluxo de notificações, o sistema adota comunicação assíncrona via RabbitMQ, onde o Serviço de Pedidos publica eventos em filas e o Serviço de Notificação os consome de forma independente, sem bloquear o fluxo principal de compra.

Camada de Apresentação: cliente web React que se comunica exclusivamente com o API Gateway.

Camada de Gateway: Nginx responsável por roteamento, validação JWT e CORS.

Camada de Serviços: seis serviços REST independentes desenvolvidos em .NET, Node.js e Python.

Camada de Mensageria: RabbitMQ para comunicação assíncrona entre OrderService e NotificationService.

Camada de Dados: PostgreSQL com schemas segregados por serviço.

---

## Portas dos Componentes

| Componente | Porta |
|------|------|
| Frontend | 3000 |
| API Gateway | 8080 |
| UserService | 5001 |
| CatalogService | 5002 |
| StockService | 5003 |
| OrderService | 5004 |
| PaymentService | 5005 |
| NotificationService | — |
| Banco de Dados | 5432 |
| Mensageria | 5672 / 15672 |



# Tecnologias Utilizadas


O projeto será desenvolvido utilizando um conjunto de tecnologias modernas para frontend, backend, banco de dados e mensageria, garantindo escalabilidade, desempenho e experiência de usuário de alta qualidade. 

## 1. Linguagens de Programação 

    JavaScript / TypeScript: Desenvolvimento do frontend com React, permitindo criação de interface web responsiva e interativa. 

    C# (.NET): Backend de alguns serviços (ex.: UserService, OrderService), garantindo robustez e integração com APIs REST. 

    Node.js (JavaScript/TypeScript): Backend de serviços como CatalogService ou PaymentService, facilitando comunicação assíncrona e rápido desenvolvimento de APIs. 

    Python: Serviço de worker NotificationService para processamento assíncrono de eventos via RabbitMQ. 

    SQL (PostgreSQL): Persistência de dados, com schemas separados por serviço para isolamento lógico. 

 ---

## 2. Frameworks e Bibliotecas 

    React – construção do frontend. 
  
    .NET Core – criação de APIs REST e lógica de negócios para backend. 
  
    Express.js – framework Node.js para desenvolvimento de APIs REST. 
  
    BCrypt – hash de senhas no UserService. 
  
    JWT (JSON Web Token) – autenticação segura de usuários. 
  
    Axios / Fetch API – chamadas HTTP no frontend. 

    RabbitMQ – mensageria assíncrona entre OrderService e NotificationService. 

    Docker

