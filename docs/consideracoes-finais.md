# Considerações Finais

Este documento apresenta uma análise sobre a conclusão do projeto **E-Commerce Escalável**, avaliando as tecnologias empregadas, refletindo de maneira crítica sobre as decisões arquiteturais tomadas durante o desenvolvimento, e consolidando as contribuições de cada membro da equipe.

---

### 1. Visão geral da solução entregue

A plataforma foi construída como um **sistema distribuído com arquitetura de serviços (orientada a serviços / SOA)**, orquestrado via Docker Compose, com um API Gateway na borda e comunicação assíncrona por mensageria para o fluxo de pedidos. Cada capacidade de negócio (usuários, catálogo, estoque, pedidos, pagamento, notificação) é um serviço independente e implantável em separado, integrados por um banco de dados relacional compartilhado e por mensageria.


## 1.1 Avaliação dos Frameworks e Tecnologias Utilizados

O desenvolvimento da plataforma de E-Commerce Escalável exigiu a seleção de tecnologias robustas e adequadas para suportar os requisitos de alta disponibilidade e escalabilidade.

**Backend e Microserviços (Abordagem Poliglota):**
Adotamos uma arquitetura orientada a serviços (SOA/Microserviços) tirando proveito dos pontos fortes de diferentes ecossistemas:

- **Java com Spring Boot (`CatalogAPI` e `OrderAPI`)**: Utilizado devido ao seu robusto ecossistema corporativo, facilidade de injeção de dependências e excelente suporte ao gerenciamento de transações. O Spring se mostrou ideal para orquestrar pedidos complexos.

- **C# / .NET (`StockAPI` e `NotificationWorker`)**: Escolhido pela alta performance e forte tipagem. Demonstrou ser uma ferramenta excelente para o gerenciamento de estoque (onde velocidade e consistência transacional são cruciais) e para o processamento em *background* de filas de mensagens.EF Core produtivo e tipagem forte; bom desempenho; worker de notificação simples e eficiente como consumidor de eventos.

- **Node.js (`UsersAPI`, `PaymentAPI`)**: - *Pontos fortes:* baixa cerimônia, prototipagem rápida, ótimo para serviços de I/O leve como autenticação e o gateway de pagamento simulado. Ecossistema maduro (`jsonwebtoken`, `bcrypt`).
- *Limitações:* ausência de tipagem forte no serviço de usuários (JavaScript puro) tornou contratos implícitos e propensos a divergência; validação e estrutura de camadas dependem de disciplina manual.


**Mensageria e Banco de Dados:**
- **RabbitMQ**: A adoção de mensageria assíncrona foi um diferencial. Eventos como `ORDER_CONFIRMED` e `PAYMENT_REFUSED` são processados em *background* pelo `NotificationWorker`, o que evitou gargalos nas chamadas HTTP síncronas e aumentou a resiliência do sistema perante falhas temporárias no envio de notificações.
- **PostgreSQL**: Sólido como escolha de banco de dados relacional. Cada domínio de serviço manteve seus *schemas* isolados logicamente, prevenindo o acoplamento forte nos dados, mesmo que em um ambiente de desenvolvimento tenham compartilhado o mesmo servidor.

**Infraestrutura e Gateway:**
- **Docker e Docker Compose**: Fundamental para a reprodutibilidade. Com um único comando (`docker compose up`), todo o ecossistema (banco, fila, e os 6 microserviços) é orquestrado, garantindo total paridade entre a máquina de cada desenvolvedor.

- **Nginx (API Gateway)**: - Eficiente como reverse proxy e ponto único de CORS. A configuração `map`/`add_header` é simples, porém sensível: a sobreposição de CORS entre gateway e serviço gerou header duplicado (corrigido nesta etapa).

**Frontend:**
- **React / React Native**: React 19 + Vite + Tailwind 4
- *Pontos fortes:* DX excelente (HMR do Vite), Tailwind acelerou a prototipação visual, React Router 7 cobriu o roteamento e a proteção de rotas (`PrivateRoute`).
- *A amadurecer:* coexistência de arquivos `.jsx` e `.tsx` enfraquece os benefícios da tipagem; faltou um *design system* compartilhado.

Expo + React Native Paper
- *Pontos fortes:* Expo Router trouxe roteamento baseado em arquivos coerente com a web; React Native Paper deu consistência visual rápida; `expo-sqlite/kv-store` resolveu persistência (carrinho e sessão) sem dependência extra.
- *A amadurecer:* credencial idealmente deveria usar `expo-secure-store` (armazenamento criptografado).


---

## 2. Análise Crítica e Proposta de Melhorias

### Análise da Arquitetura e Desenvolvimento
  O processo de construção baseada em microsserviços cumpriu a proposta de separar domínios lógicos. Identificamos seis
  serviços com responsabilidades próprias — Usuários, Catálogo, Estoque, Pedidos, Pagamento e Notificação.

  No entanto, percebemos que o OrderService assume o papel de um orquestrador majoritariamente síncrono. A criação de
  pedido faz chamadas HTTP bloqueantes (via RestTemplate) ao CatalogAPI (validar SKU) e ao StockAPI (reservar estoque);
  o pagamento é etapa síncrona separada, que chama o PaymentAPI e confirma ou libera a reserva conforme o resultado.

  Essa dependência síncrona gera um risco arquitetural: se Estoque, Catálogo ou Pagamento estiverem inoperantes, a
  operação correspondente falha por inteiro, reduzindo a resiliência (availability) em nome de consistência imediata
  (consistency) — trade-off clássico do teorema CAP.

### Propostas de Melhoria Futura

1. Evolução para o Padrão Saga Coreografada: Hoje o OrderAPI atua como uma saga orquestrada — ele coordena as chamadas e faz a compensação manual. A evolução seria torná-lo 100% baseado em eventos: ao invés de chamadas HTTP síncronas para pagamento e estoque, o pedido ficaria em estado "Pendente" logo na criação e emitiria eventos via RabbitMQ   (mensageria que já está provisionada no docker-compose). Estoque e pagamento consumiriam as filas e responderiam de
forma assíncrona, aumentando consideravelmente a tolerância a falhas.
2. Separação Física dos Bancos de Dados: O modelo atual usa uma única instância PostgreSQL com separação lógica por schemas (users, catalog, stock, orders, payments, notifications, definidos em db/init.sql). Em cenário de altíssima escala, cada microsserviço receberia seu próprio banco físico/cluster, evitando concorrência de hardware e prevenindo Single Point of Failure no database tier.
3. Padrão Circuit Breaker: Adicionar Circuit Breakers nas integrações que permanecerem síncronas. Como a stack é poliglota, a biblioteca varia por serviço: Resilience4j para os serviços Java (ex.: OrderAPI, principal chamador síncrono), Polly para os .NET (StockAPI, Notification) e uma lib equivalente (ex.: opossum) para os Node (PaymentAPI,   UsersAPI). Assim, na intermitência de um dependente, as requisições são cortadas rapidamente, evitando sobrecarga e timeout longo para o usuário.
4. Implementação de CI/CD: O projeto já possui o script smoke-e2e (src/scripts/smoke-e2e.ps1), porém ele ainda é executado manualmente — o único workflow ativo é o de rastreamento de contribuições. A melhoria é criar um pipeline de integração contínua (GitHub Actions) que rode os testes automatizados e o smoke-e2e a cada novo Pull Request.

---

## 3. Gestão de Trabalho e Contribuições da Equipe

*Esta seção reflete o acompanhamento visual da gestão de trabalho da equipe durante a disciplina.*

**Quadro Visual:**

<img width="731" height="502" alt="image" src="https://github.com/user-attachments/assets/98007a4a-18cb-4515-812e-251323cb96d0" />


**Status de Contribuições:**

<img width="954" height="468" alt="image" src="https://github.com/user-attachments/assets/1571c29e-7624-4c7c-9f8a-65292d755d12" />


*Observação: Detalhamentos de commits e relatórios completos estão arquivados e gerados automaticamente no artefato ./CONTRIBUTION_REPORT.md.*

---

## 4. Responsabilidades e Atribuições de Cada Membro

Abaixo descrevemos os principais focos de desenvolvimento e atuação para cada integrante do grupo no decorrer do projeto:


- **Hugo Freitas da Cruz**: Criação da API "Payment" (Back-end, Front-end, Mobile e  elaboração da documentação relacionada.)
- **Carlos Alberto Morais Junior**: Sem contribuições de desenvolvimento. Atuou apenas na seção inicial "Problema" da documentação (Etapa 1), sem entregas de código nas etapas seguintes.
- **Gabriel Freitas Cambraia**: Criação da API "Catalog" (Back-end, Front-end, Mobile e elaboração da documentação relacionada.)
- **João Gabriel Perez Monteiro**: Desenvolvimento, testes e documentação da API "Order" (Back-end, Front-end e Mobile.)
- **Marcos Vinício Araújo Almeida**: Criação da API "Users" (Back-end, Front-end, Mobile e elaboração da documentação relacionada.)
- **Nicolas Pontes Borges**: Bootstrap do projeto, definição da arquitetura, implementação da pipeline docker das API, implementação do gateway, min IO (CDN) e implementação da feature Stock (mobile, front, API e documentação correspondente)
- **Vitor Gabriel Linas**: Criação do Worker "Notification" (Back-end, Front-end, Mobile e elaboração da documentação relacionada.)
