# Catálogo de Skills Disponíveis

Este documento lista as skills disponíveis no contexto atual de trabalho e explica, para cada uma:

- Por que existe
- O que resolve
- Como usar

## Escopo

- Skills locais do repositório: disponíveis para o projeto atual.
- Skills globais do ambiente: instaladas no perfil local e reutilizáveis em outros projetos.

Observação: skills globais podem variar entre máquinas e usuários.

## Inventário

| Skill | Origem | Foco Principal |
|---|---|---|
| ecom-services-architecture | Local (repositório) | Arquitetura SOA para e-commerce |
| cloud-solution-architect | Global | Arquitetura cloud baseada em Azure |
| continual-learning | Global | Aprendizado contínuo para agentes |
| copilot-sdk | Global | Integrações programáticas com Copilot |
| entra-agent-id | Global | Identidade OAuth2 para agentes via Entra |
| find-skills | Global | Descoberta e instalação de skills |
| frontend-design-review | Global | Revisão e criação de interfaces frontend |
| mcp-builder | Global | Criação de servidores MCP |
| skill-creator | Global | Criação e manutenção de skills |
| agent-customization | Global | Customização de instruções/agentes/skills |

## 1) ecom-services-architecture

Origem: Local (repositório)

Por que existe:
Padronizar a evolução da arquitetura de microserviços do e-commerce (serviços, gateway, banco, Docker e comunicação entre serviços).

O que resolve:
Evita inconsistências entre times ao criar endpoints, estruturar serviços, configurar docker-compose, definir contratos e aplicar princípios de Clean Code, SOLID e DDD.

Como usar:
Use esta skill quando for criar/alterar microserviços, controllers, contratos de API, arquivos de containerização e regras de comunicação entre serviços.

Exemplo de uso no prompt:
"Use a skill ecom-services-architecture para revisar o StockAPI e propor ajustes de DDD Lite e concorrência."

## 2) cloud-solution-architect

Origem: Global

Por que existe:
Guiar decisões arquiteturais em nuvem com boas práticas do Azure Architecture Center.

O que resolve:
Ajuda a escolher estilo arquitetural, padrões cloud, serviços gerenciados e trade-offs de confiabilidade, custo, performance, operação e segurança.

Como usar:
Acione em tarefas de desenho de arquitetura, revisão de solução, análise Well-Architected ou escolha tecnológica para ambientes cloud.

Exemplo de uso no prompt:
"Aplique a skill cloud-solution-architect para revisar esta arquitetura e-commerce e sugerir melhorias de resiliência e custo."

## 3) continual-learning

Origem: Global

Por que existe:
Permitir aprendizado contínuo de agentes entre sessões, reduzindo repetição de erros.

O que resolve:
Registra padrões úteis (falhas recorrentes de ferramenta, convenções de projeto, preferências) e reaplica esse conhecimento no futuro.

Como usar:
Use quando quiser estruturar memória de longo prazo para agentes, com escopo global e local, hooks de captura e ciclo de reflexão.

Exemplo de uso no prompt:
"Use a skill continual-learning para definir um fluxo de memória local/global para este projeto."

## 4) copilot-sdk

Origem: Global

Por que existe:
Acelerar construção de aplicações que integram programaticamente com o GitHub Copilot.

O que resolve:
Facilita setup de cliente/sessão/mensagens, streaming, ferramentas customizadas, integração MCP e persistência de sessão em Node, Python, Go e .NET.

Como usar:
Acione quando for implementar produto ou automação com Copilot SDK, escolhendo linguagem, transporte e padrão de integração.

Exemplo de uso no prompt:
"Use a skill copilot-sdk para criar um exemplo em Node com sessão, streaming e uma tool customizada."

## 5) entra-agent-id

Origem: Global

Por que existe:
Orientar provisionamento de identidades de agentes com OAuth2 no Microsoft Entra via Microsoft Graph (beta).

O que resolve:
Evita erros comuns de permissão, sponsor e criação de Blueprint/BlueprintPrincipal/Agent Identity, além de orientar autenticação correta.

Como usar:
Use em cenários de identidade de agentes, autenticação de agentes de terceiros e integração com sidecar/Workload Identity Federation.

Exemplo de uso no prompt:
"Use a skill entra-agent-id para montar o passo a passo de criação de Agent Identity com Python e Graph beta."

## 6) find-skills

Origem: Global

Por que existe:
Ajudar a descobrir skills existentes antes de reinventar solução manual.

O que resolve:
Reduz tempo de pesquisa, melhora qualidade de recomendação e orienta instalação/atualização de skills com critérios de confiança.

Como usar:
Acione quando a necessidade for "existe skill para X?", "qual skill usar para Y?" ou quando quiser ampliar capacidades do agente.

Exemplo de uso no prompt:
"Use a skill find-skills para buscar skills de revisão de PR e testes E2E."

## 7) frontend-design-review

Origem: Global

Por que existe:
Aumentar qualidade visual e funcional de interfaces com revisão orientada por critérios claros.

O que resolve:
Ajuda a revisar UI por pilares (fricção, craft, confiança), aderência ao design system e acessibilidade; também apoia criação de interfaces mais distintas.

Como usar:
Use em review de PR frontend, auditoria de acessibilidade, validação de responsividade e criação de novas telas com direção estética intencional.

Exemplo de uso no prompt:
"Use a skill frontend-design-review para auditar esta tela de checkout e apontar problemas de acessibilidade e hierarquia de ação."

## 8) mcp-builder

Origem: Global

Por que existe:
Apoiar desenvolvimento de servidores MCP robustos e úteis para interação de LLMs com sistemas externos.

O que resolve:
Organiza processo de pesquisa, modelagem de ferramentas, implementação, testes e avaliação de servidores MCP em TypeScript, Python ou .NET.

Como usar:
Acione quando for criar MCP server novo, evoluir ferramenta MCP existente ou decidir entre servidor customizado e servidores Microsoft já prontos.

Exemplo de uso no prompt:
"Use a skill mcp-builder para desenhar um MCP server para integração com API interna de pedidos."

## 9) skill-creator

Origem: Global

Por que existe:
Padronizar criação de skills úteis, concisas e acionáveis para agentes de engenharia.

O que resolve:
Evita skills longas, genéricas ou frágeis; orienta estrutura de SKILL.md, frontmatter, referências e boas práticas para Azure SDKs.

Como usar:
Use ao criar nova skill ou revisar skill existente, definindo gatilhos claros, escopo correto e instruções efetivas.

Exemplo de uso no prompt:
"Use a skill skill-creator para estruturar uma nova skill de integração com o serviço de pagamentos deste projeto."

## 10) agent-customization

Origem: Global

Por que existe:
Facilitar customização de comportamento de agentes por meio de arquivos de instrução e configuração.

O que resolve:
Ajuda a criar, revisar e corrigir arquivos de customização como .instructions.md, .prompt.md, .agent.md, SKILL.md e AGENTS.md.

Como usar:
Acione quando precisar ajustar o comportamento do agente, corrigir frontmatter YAML, definir applyTo e regras de ferramenta, ou organizar modos especializados de trabalho.

Exemplo de uso no prompt:
"Use a skill agent-customization para revisar minhas instruções e corrigir o frontmatter YAML."

## Guia Rápido de Escolha

| Se você precisa... | Skill recomendada |
|---|---|
| Evoluir microserviços e padrões do e-commerce | ecom-services-architecture |
| Revisar/definir arquitetura cloud | cloud-solution-architect |
| Criar memória de aprendizado para o agente | continual-learning |
| Construir integração programática com Copilot | copilot-sdk |
| Provisionar identidade OAuth2 para agentes | entra-agent-id |
| Descobrir skill para um problema novo | find-skills |
| Revisar ou criar UI frontend de alta qualidade | frontend-design-review |
| Construir servidor MCP | mcp-builder |
| Criar/ajustar skills de forma correta | skill-creator |
| Ajustar instruções e comportamento do agente | agent-customization |

## Notas de Uso

- Prefira prompts explícitos sobre objetivo, contexto e resultado esperado.
- Para tarefas críticas, informe restrições técnicas (stack, prazos, compliance, segurança).
- Em casos de dúvida entre duas skills, peça uma recomendação antes da execução.
