# Introdução

Texto descritivo com a visão geral do projeto abordado. Inclui o contexto, o problema, os objetivos, a justificativa e o público-alvo do projeto.

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

# Especificações do Projeto

## Requisitos

As tabelas que se seguem apresentam os requisitos funcionais e não funcionais que detalham o escopo do projeto. Para determinar a prioridade de requisitos, aplicar uma técnica de priorização de requisitos e detalhar como a técnica foi aplicada.

### Requisitos Funcionais

|ID    | Descrição do Requisito  | Prioridade |
|------|-----------------------------------------|----|
|RF-001| Permitir que o usuário cadastre tarefas | ALTA | 
|RF-002| Emitir um relatório de tarefas no mês   | MÉDIA |

### Requisitos não Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
|RNF-001| O sistema deve ser responsivo para rodar em um dispositivos móvel | MÉDIA | 
|RNF-002| Deve processar requisições do usuário em no máximo 3s |  BAIXA | 

Com base nas Histórias de Usuário, enumere os requisitos da sua solução. Classifique esses requisitos em dois grupos:

- [Requisitos Funcionais
 (RF)](https://pt.wikipedia.org/wiki/Requisito_funcional):
 correspondem a uma funcionalidade que deve estar presente na
  plataforma (ex: cadastro de usuário).
- [Requisitos Não Funcionais
  (RNF)](https://pt.wikipedia.org/wiki/Requisito_n%C3%A3o_funcional):
  correspondem a uma característica técnica, seja de usabilidade,
  desempenho, confiabilidade, segurança ou outro (ex: suporte a
  dispositivos iOS e Android).
Lembre-se que cada requisito deve corresponder à uma e somente uma
característica alvo da sua solução. Além disso, certifique-se de que
todos os aspectos capturados nas Histórias de Usuário foram cobertos.

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

|ID| Restrição                                             |
|--|-------------------------------------------------------|
|01| O projeto deverá ser entregue até o final do semestre |
|02| Não pode ser desenvolvido um módulo de backend        |

Enumere as restrições à sua solução. Lembre-se de que as restrições geralmente limitam a solução candidata.

> **Links Úteis**:
> - [O que são Requisitos Funcionais e Requisitos Não Funcionais?](https://codificar.com.br/requisitos-funcionais-nao-funcionais/)
> - [O que são requisitos funcionais e requisitos não funcionais?](https://analisederequisitos.com.br/requisitos-funcionais-e-requisitos-nao-funcionais-o-que-sao/)

# Catálogo de Serviços

Descreva aqui todos os serviços que serão disponibilizados pelo seu projeto, detalhando suas características e funcionalidades.

# Arquitetura da Solução

Definição de como o software é estruturado em termos dos componentes que fazem parte da solução e do ambiente de hospedagem da aplicação.

![arq](https://github.com/user-attachments/assets/b9402e05-8445-47c3-9d47-f11696e38a3d)


## Tecnologias Utilizadas


O projeto será desenvolvido utilizando um conjunto de tecnologias modernas para frontend, backend, banco de dados e mensageria, garantindo escalabilidade, desempenho e experiência de usuário de alta qualidade. 

<br>

> 1. Linguagens de Programação 

  >> JavaScript / TypeScript: Desenvolvimento do frontend com React, permitindo criação de interface web responsiva e interativa. 

  >> C# (.NET): Backend de alguns serviços (ex.: UserService, OrderService), garantindo robustez e integração com APIs REST. 

  >> Node.js (JavaScript/TypeScript): Backend de serviços como CatalogService ou PaymentService, facilitando comunicação assíncrona e rápido desenvolvimento de APIs. 

  >> Python: Serviço de worker NotificationService para processamento assíncrono de eventos via RabbitMQ. 

  >> SQL (PostgreSQL): Persistência de dados, com schemas separados por serviço para isolamento lógico. 

  <br>

> 2. Frameworks e Bibliotecas 

  >> React – construção do frontend. 
  
  >> .NET Core – criação de APIs REST e lógica de negócios para backend. 
  
  >> Express.js – framework Node.js para desenvolvimento de APIs REST. 
  
  >> BCrypt – hash de senhas no UserService. 
  
  >> JWT (JSON Web Token) – autenticação segura de usuários. 
  
  >> Axios / Fetch API – chamadas HTTP no frontend. 

  >> RabbitMQ – mensageria assíncrona entre OrderService e NotificationService. 

  <br>

> 3. Serviços Web e APIs 

  >> APIs REST: todos os serviços backend expõem endpoints REST para comunicação interna e com o frontend. 
  
  >> API Gateway (Nginx): roteamento, validação de tokens JWT e controle de CORS. 

   <br>

> 4. Banco de Dados 

  >> PostgreSQL: banco relacional, organizado em schemas separados por serviço, garantindo isolamento lógico e consistência. 

  <br>

> 5. Ferramentas e IDEs 

  >> Visual Studio / Visual Studio Code – desenvolvimento de backend e frontend. 
  
  >> Postman / Insomnia – testes de APIs REST. 
  
  >> Docker – containerização dos serviços para facilitar deploy e testes. 
  
  >> Git / GitHub – controle de versão. 

  <br>

> 6. Fluxo de Interação do Usuário 

  >> O fluxo de interação entre usuário e sistema segue o seguinte caminho: 
  
  >> O usuário acessa o frontend React (porta 3000). 
  
  >> As requisições são enviadas ao API Gateway (Nginx) (porta 8080), que valida o token JWT e roteia para o serviço correspondente: 
  
  >> UserService (5001) → cadastro, login e perfil. 
  
  >> CatalogService (5002) → listagem e busca de produtos. 
  
  >> OrderService (5004) → criação e consulta de pedidos. 
  
  >> O OrderService orquestra os processos de: 
  
  >> StockService (5003) → reserva e confirmação de estoque. 
  
  >> PaymentService (5005) → processamento de pagamento simulado. 
  
  >> Eventos gerados pelo OrderService são enviados para o NotificationService via RabbitMQ (5672 / 15672), que envia notificações por e-mail ao usuário. 

  >> A resposta final é enviada ao frontend, que exibe informações atualizadas sobre produtos, pedidos e status de pagamento. 

 

 

                                    Usuário (Browser/React) 
                                    
                                           │ 
                                    
                                           ▼ 
                                    
                                      Frontend (React) 
                                    
                                           │ 
                                    
                                           ▼ 
                                    
                                       API Gateway (Nginx) ──────────────┐ 
                                    
                                           │                             │ 
                                    
                                           ▼                             │ 
                                    
                                    ┌──────────────┐                ┌───────────────┐ 
                                    
                                    │  UserService │                │ CatalogService│ 
                                    
                                    │    (5001)    │                │    (5002)     │ 
                                    
                                    └──────────────┘                └───────────────┘ 
                                    
                                           │                             │ 
                                    
                                           ▼                             ▼ 
                                    
                                    ┌──────────────┐ 
                                    
                                    │ OrderService │ 
                                    
                                    │    (5004)    │ 
                                    
                                    └──────────────┘ 
                                    
                                       │       │       │ 
                                    
                                       ▼       ▼       ▼ 
                                    
                                    StockService PaymentService RabbitMQ 
                                    
                                       (5003)     (5005)      │ 
                                    
                                                             ▼ 
                                    
                                                   NotificationService 
                                                              
                                                                                    


## Hospedagem

A plataforma será hospedada em um ambiente institucional da PUC Minas e também gerenciada via GitHub, garantindo controle de versão, facilidade de acesso e testes dentro da rede da universidade. 

<br>

> 1. Hospedagem do Frontend 

  >> O frontend React será hospedado no GitHub, utilizando GitHub Pages ou outro serviço interno da PUC Minas que permita servir a interface web. 
  
  >> Isso permite que a equipe faça atualizações contínuas do frontend, com integração direta ao repositório, facilitando manutenção e versionamento. 

<br>

> 2. Hospedagem do Backend 

  >> Os serviços backend (UserService, CatalogService, StockService, OrderService, PaymentService) serão hospedados no portão da PUC Minas, dentro da rede institucional. 
  
  >> Cada serviço será executado em containers Docker ou máquinas virtuais, garantindo isolamento e facilidade de configuração, mesmo em ambiente local ou restrito à rede da universidade. 

<br>

> 3. Banco de Dados 

  >> O PostgreSQL será hospedado dentro da infraestrutura da PUC Minas, garantindo acesso controlado apenas aos serviços da plataforma. 
  
  >> Os dados serão organizados em schemas separados por serviço, mantendo segurança e isolamento lógico. 

<br>

> 4. Mensageria 

  >> O RabbitMQ também será hospedado dentro do ambiente da universidade, permitindo comunicação assíncrona entre o OrderService e o NotificationService. 
  
  >> Isso garante que notificações e eventos de pedidos funcionem corretamente mesmo em ambiente local ou restrito à rede da PUC Minas. 

<br>

> 5. API Gateway e Segurança 

  >> O Nginx funcionará como API Gateway dentro da rede da PUC Minas, roteando requisições do frontend para os serviços corretos, validando JWT e aplicando regras de CORS. 

<br>

> 6. Lançamento da Plataforma 

  >> O lançamento será feito seguindo estas etapas: 
  
  >> Desenvolvimento e Versionamento: Todos os serviços e frontend são versionados no GitHub, permitindo integração contínua e colaboração entre os membros do grupo. 
  
  >> Testes Internos: A plataforma será testada dentro da rede da PUC Minas, simulando acesso real de usuários da universidade. 
  
  >> Deploy Interno: Serviços backend, banco de dados e mensageria serão disponibilizados no portão da PUC Minas, permitindo acesso seguro e controlado. 
  
  >> Atualizações Contínuas: Alterações no código podem ser integradas via GitHub, facilitando correções e melhorias sem afetar o ambiente de produção. 

<br>

> 7. Benefícios da Estratégia 

  >> Acesso controlado: Apenas usuários dentro da rede da PUC Minas podem acessar a plataforma, garantindo segurança. 
  
  >> Versionamento: O uso do GitHub permite histórico completo de alterações e colaboração entre o grupo. 
  
  >> Facilidade de deploy e testes: Ambiente interno e containers Docker facilitam testes integrados antes do lançamento. 
