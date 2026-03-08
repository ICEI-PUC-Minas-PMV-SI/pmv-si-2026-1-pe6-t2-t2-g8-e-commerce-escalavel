# Introdução

Texto descritivo com a visão geral do projeto abordado. Inclui o contexto, o problema, os objetivos, a justificativa e o público-alvo do projeto.

## Problema
Nesse momento você deve apresentar o problema que a sua aplicação deve  resolver. No entanto, não é a hora de comentar sobre a aplicação.

Descreva também o contexto em que essa aplicação será usada, se  houver: empresa, tecnologias, etc. Novamente, descreva apenas o que de  fato existir, pois ainda não é a hora de apresentar requisitos  detalhados ou projetos.

Nesse momento, o grupo pode optar por fazer uso  de ferramentas como Design Thinking, que permite um olhar de ponta a ponta para o problema.

> **Links Úteis**:
> - [Objetivos, Problema de pesquisa e Justificativa](https://medium.com/@versioparole/objetivos-problema-de-pesquisa-e-justificativa-c98c8233b9c3)
> - [Matriz Certezas, Suposições e Dúvidas](https://medium.com/educa%C3%A7%C3%A3o-fora-da-caixa/matriz-certezas-suposi%C3%A7%C3%B5es-e-d%C3%BAvidas-fa2263633655)
> - [Brainstorming](https://www.euax.com.br/2018/09/brainstorming/)

## Objetivos

Objetivo geral

Temos como objetivo geral desenvolver um sistema de e-commerce escalável e distribuído, visando solucionar as limitações de infraestrutura e disponibilidade apresentadas anteriormente, garantindo uma plataforma de alta performance capaz de suportar grandes volumes de acessos simultâneos com estabilidade e segurança.

Objetivos específicos

- Otimizar o desempenho e o tempo de resposta: Implementar técnicas de arquitetura que proporcionem uma experiência de navegação fluida, intuitiva e de baixa latência para o usuário final.

- Implementar funcionalidades essenciais de operação: Construir os módulos fundamentais de navegação, cadastro de clientes, listagem dinâmica de produtos e gerenciamento de pedidos, garantindo a integridade do ciclo de uso.

## Justificativa

Descreva a importância ou a motivação para trabalhar com esta aplicação que você escolheu. Indique as razões pelas quais você escolheu seus objetivos específicos ou as razões para aprofundar em certos aspectos do software.

O grupo de trabalho pode fazer uso de questionários, entrevistas e dados estatísticos, que podem ser apresentados, com o objetivo de esclarecer detalhes do problema que será abordado pelo grupo.

> **Links Úteis**:
> - [Como montar a justificativa](https://guiadamonografia.com.br/como-montar-justificativa-do-tcc/)

## Público-Alvo

Descreva quem serão as pessoas que usarão a sua aplicação indicando os diferentes perfis. O objetivo aqui não é definir quem serão os clientes ou quais serão os papéis dos usuários na aplicação. A ideia é, dentro do possível, conhecer um pouco mais sobre o perfil dos usuários: conhecimentos prévios, relação com a tecnologia, relações
hierárquicas, etc.

Adicione informações sobre o público-alvo por meio de uma descrição textual, diagramas de personas e mapa de stakeholders.

> **Links Úteis**:
> - [Público-alvo](https://blog.hotmart.com/pt-br/publico-alvo/)
> - [Como definir o público alvo](https://exame.com/pme/5-dicas-essenciais-para-definir-o-publico-alvo-do-seu-negocio/)
> - [Público-alvo: o que é, tipos, como definir seu público e exemplos](https://klickpages.com.br/blog/publico-alvo-o-que-e/)
> - [Qual a diferença entre público-alvo e persona?](https://rockcontent.com/blog/diferenca-publico-alvo-e-persona/)

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

1. Linguagens de Programação 

  JavaScript / TypeScript: Desenvolvimento do frontend com React, permitindo criação de interface web responsiva e interativa. 

  C# (.NET): Backend de alguns serviços (ex.: UserService, OrderService), garantindo robustez e integração com APIs REST. 

  Node.js (JavaScript/TypeScript): Backend de serviços como CatalogService ou PaymentService, facilitando comunicação assíncrona e rápido desenvolvimento de APIs. 

  Python: Serviço de worker NotificationService para processamento assíncrono de eventos via RabbitMQ. 

  SQL (PostgreSQL): Persistência de dados, com schemas separados por serviço para isolamento lógico. 

2. Frameworks e Bibliotecas 

  React – construção do frontend. 
  
  .NET Core – criação de APIs REST e lógica de negócios para backend. 
  
  Express.js – framework Node.js para desenvolvimento de APIs REST. 
  
  BCrypt – hash de senhas no UserService. 
  
  JWT (JSON Web Token) – autenticação segura de usuários. 
  
  Axios / Fetch API – chamadas HTTP no frontend. 

  RabbitMQ – mensageria assíncrona entre OrderService e NotificationService. 

3. Serviços Web e APIs 

  APIs REST: todos os serviços backend expõem endpoints REST para comunicação interna e com o frontend. 
  
  API Gateway (Nginx): roteamento, validação de tokens JWT e controle de CORS. 

4. Banco de Dados 

  PostgreSQL: banco relacional, organizado em schemas separados por serviço, garantindo isolamento lógico e consistência. 

5. Ferramentas e IDEs 

  Visual Studio / Visual Studio Code – desenvolvimento de backend e frontend. 
  
  Postman / Insomnia – testes de APIs REST. 
  
  Docker – containerização dos serviços para facilitar deploy e testes. 
  
  Git / GitHub – controle de versão. 

6. Fluxo de Interação do Usuário 

  O fluxo de interação entre usuário e sistema segue o seguinte caminho: 
  
  O usuário acessa o frontend React (porta 3000). 
  
  As requisições são enviadas ao API Gateway (Nginx) (porta 8080), que valida o token JWT e roteia para o serviço correspondente: 
  
  UserService (5001) → cadastro, login e perfil. 
  
  CatalogService (5002) → listagem e busca de produtos. 
  
  OrderService (5004) → criação e consulta de pedidos. 
  
  O OrderService orquestra os processos de: 
  
  StockService (5003) → reserva e confirmação de estoque. 
  
  PaymentService (5005) → processamento de pagamento simulado. 
  
  Eventos gerados pelo OrderService são enviados para o NotificationService via RabbitMQ (5672 / 15672), que envia notificações por e-mail ao usuário. 

  A resposta final é enviada ao frontend, que exibe informações atualizadas sobre produtos, pedidos e status de pagamento. 

 

 

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

1. Hospedagem do Frontend 

  O frontend React será hospedado no GitHub, utilizando GitHub Pages ou outro serviço interno da PUC Minas que permita servir a interface web. 
  
  Isso permite que a equipe faça atualizações contínuas do frontend, com integração direta ao repositório, facilitando manutenção e versionamento. 

2. Hospedagem do Backend 

  Os serviços backend (UserService, CatalogService, StockService, OrderService, PaymentService) serão hospedados no portão da PUC Minas, dentro da rede institucional. 
  
  Cada serviço será executado em containers Docker ou máquinas virtuais, garantindo isolamento e facilidade de configuração, mesmo em ambiente local ou restrito à rede da universidade. 

3. Banco de Dados 

  O PostgreSQL será hospedado dentro da infraestrutura da PUC Minas, garantindo acesso controlado apenas aos serviços da plataforma. 
  
  Os dados serão organizados em schemas separados por serviço, mantendo segurança e isolamento lógico. 

4. Mensageria 

  O RabbitMQ também será hospedado dentro do ambiente da universidade, permitindo comunicação assíncrona entre o OrderService e o NotificationService. 
  
  Isso garante que notificações e eventos de pedidos funcionem corretamente mesmo em ambiente local ou restrito à rede da PUC Minas. 

5. API Gateway e Segurança 

  O Nginx funcionará como API Gateway dentro da rede da PUC Minas, roteando requisições do frontend para os serviços corretos, validando JWT e aplicando regras de CORS. 

6. Lançamento da Plataforma 

  O lançamento será feito seguindo estas etapas: 
  
  Desenvolvimento e Versionamento: Todos os serviços e frontend são versionados no GitHub, permitindo integração contínua e colaboração entre os membros do grupo. 
  
  Testes Internos: A plataforma será testada dentro da rede da PUC Minas, simulando acesso real de usuários da universidade. 
  
  Deploy Interno: Serviços backend, banco de dados e mensageria serão disponibilizados no portão da PUC Minas, permitindo acesso seguro e controlado. 
  
  Atualizações Contínuas: Alterações no código podem ser integradas via GitHub, facilitando correções e melhorias sem afetar o ambiente de produção. 

7. Benefícios da Estratégia 

  Acesso controlado: Apenas usuários dentro da rede da PUC Minas podem acessar a plataforma, garantindo segurança. 
  
  Versionamento: O uso do GitHub permite histórico completo de alterações e colaboração entre o grupo. 
  
  Facilidade de deploy e testes: Ambiente interno e containers Docker facilitam testes integrados antes do lançamento. 
