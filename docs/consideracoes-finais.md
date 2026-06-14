# Considerações Finais

Este documento apresenta uma análise sobre a conclusão do projeto **E-Commerce Escalável**, avaliando as tecnologias empregadas, refletindo de maneira crítica sobre as decisões arquiteturais tomadas durante o desenvolvimento, e consolidando as contribuições de cada membro da equipe.

---

## 1. Avaliação dos Frameworks e Tecnologias Utilizados

O desenvolvimento da plataforma de E-Commerce Escalável exigiu a seleção de tecnologias robustas e adequadas para suportar os requisitos de alta disponibilidade e escalabilidade.

**Backend e Microserviços (Abordagem Poliglota):**
Adotamos uma arquitetura orientada a serviços (SOA/Microserviços) tirando proveito dos pontos fortes de diferentes ecossistemas:
- **Java com Spring Boot (`CatalogAPI` e `OrderAPI`)**: Utilizado devido ao seu robusto ecossistema corporativo, facilidade de injeção de dependências e excelente suporte ao gerenciamento de transações. O Spring se mostrou ideal para orquestrar pedidos complexos.
- **C# / .NET (`StockAPI` e `NotificationWorker`)**: Escolhido pela alta performance e forte tipagem. Demonstrou ser uma ferramenta excelente para o gerenciamento de estoque (onde velocidade e consistência transacional são cruciais) e para o processamento em *background* de filas de mensagens.
- **Node.js (`UsersAPI`, `PaymentAPI`)**: Escolhido pela agilidade e pelo vasto ecossistema *server-side* para lidar com autenticação e I/O intensivo de rede nas integrações.

**Mensageria e Banco de Dados:**
- **RabbitMQ**: A adoção de mensageria assíncrona foi um diferencial. Eventos como `ORDER_CONFIRMED` e `PAYMENT_REFUSED` são processados em *background* pelo `NotificationWorker`, o que evitou gargalos nas chamadas HTTP síncronas e aumentou a resiliência do sistema perante falhas temporárias no envio de notificações.
- **PostgreSQL**: Sólido como escolha de banco de dados relacional. Cada domínio de serviço manteve seus *schemas* isolados logicamente, prevenindo o acoplamento forte nos dados, mesmo que em um ambiente de desenvolvimento tenham compartilhado o mesmo servidor.

**Infraestrutura e Gateway:**
- **Docker e Docker Compose**: Fundamental para a reprodutibilidade. Com um único comando (`docker compose up`), todo o ecossistema (banco, fila, e os 6 microserviços) é orquestrado, garantindo total paridade entre a máquina de cada desenvolvedor.
- **Nginx (API Gateway)**: Atuou com maestria como o ponto único de entrada para o Frontend, distribuindo o tráfego adequadamente e escondendo a complexidade interna da rede dos microserviços.

**Frontend:**
- **React / React Native**: O desenvolvimento modularizado em componentes web e mobile agilizou as entregas, mantendo a consistência de identidade visual e facilitando o consumo das APIs através do Gateway.

---

## 2. Análise Crítica e Proposta de Melhorias

### Análise da Arquitetura e Desenvolvimento
O processo de construção baseada em microserviços cumpriu a proposta de separar domínios lógicos (Usuários, Catálogo, Estoque, Pedidos). No entanto, percebemos que o **OrderService** assume o papel de um "grande orquestrador síncrono". Ao receber um pedido, ele realiza chamadas HTTP bloqueantes para o `StockAPI` e o `PaymentAPI`.

Essa dependência síncrona gera um risco arquitetural: se o serviço de pagamentos ou o estoque estiverem inoperantes, a criação do pedido falhará por inteiro, diminuindo a resiliência (availability) em nome de uma consistência imediata (consistency).

Quanto ao processo de desenvolvimento, a divisão de tarefas por domínio de microsserviço ajudou a evitar conflitos de código excessivos e facilitou a revisão. A utilização do GitHub Projects serviu bem para a visibilidade.

### Propostas de Melhoria Futura

1. **Evolução para o Padrão Saga Coreografada**: No futuro, o `OrderAPI` poderia ser remodelado para ser 100% baseado em eventos. Ao invés de chamadas HTTP síncronas para pagamento e estoque, o pedido ficaria em estado "Pendente" logo na criação e emitiria eventos via RabbitMQ. O estoque e o pagamento consumiriam as filas e responderiam de forma assíncrona. Isso aumentaria a tolerância a falhas consideravelmente.
2. **Separação Física dos Bancos de Dados**: O modelo atual separa logicamente por `schemas` em uma única instância do PostgreSQL. Em um cenário real de altíssima escala, cada microsserviço receberia seu próprio banco físico/cluster para evitar concorrência de hardware e prevenir *Single Point of Failure* no *database tier*.
3. **Padrão Circuit Breaker**: Adicionar *Circuit Breakers* (como Resilience4j ou Polly) entre os serviços que ainda precisam de integração síncrona, para que em caso de intermitência de um serviço dependente, requisições sejam cortadas rapidamente (evitando sobrecarga do sistema e timeout longo para o usuário).
4. **Implementação de CI/CD**: Automação rigorosa da integração contínua (como GitHub Actions) capaz de rodar testes automatizados e o script *smoke-e2e* a cada novo Pull Request.

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
- **Carlos Alberto Morais Junior**: (Preencher atividades aqui)
- **Gabriel Freitas Cambraia**: (Preencher atividades aqui)
- **João Gabriel Perez Monteiro**: (Preencher atividades aqui)
- **Marcos Vinício Araújo Almeida**: (Preencher atividades aqui)
- **Nicolas Pontes Borges**: (Preencher atividades aqui)
- **Vitor Gabriel Linas**: (Preencher atividades aqui)
