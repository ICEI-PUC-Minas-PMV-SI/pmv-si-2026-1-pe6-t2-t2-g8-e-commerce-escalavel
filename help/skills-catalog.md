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

Por que NÃO usar:
- Tarefas puramente de documentação acadêmica (contexto.md, atas) que não envolvem código ou arquitetura técnica.
- Alterações exclusivas de frontend (HTML/CSS/UX) sem impacto na comunicação entre serviços ou contratos de API.
- Questões de infraestrutura cloud (escalabilidade, custo, deploy em nuvem) — prefira cloud-solution-architect.

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

Por que NÃO usar:
- Desenvolvimento local com docker-compose sem planos de deploy em nuvem — use ecom-services-architecture.
- Implementação de lógica de negócio (regras de estoque, pagamento, pedidos) que não envolve decisão de infraestrutura.
- Revisão de código ou refatoração que não impacta a topologia ou os serviços gerenciados da solução.

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

Por que NÃO usar:
- Tarefas pontuais de implementação ou correção de bugs que não envolvem configuração de memória de agente.
- Quando o contexto já está bem documentado em CLAUDE.md ou nas skills existentes — não duplique informação.
- Projetos curtos ou de sessão única onde persistência de aprendizado entre sessões não agrega valor.

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

Por que NÃO usar:
- Uso normal do Copilot como assistente de código — a skill é para construir integrações programáticas, não para usar o Copilot.
- Desenvolvimento de serviços do e-commerce (APIs, controllers, banco) que não envolvem integração com Copilot.
- Quando a necessidade é apenas consumir uma API REST convencional — use padrões HTTP nativos da stack.

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

Por que NÃO usar:
- Autenticação de usuários humanos — a skill é específica para identidade de agentes de IA, não para login de usuários.
- Implementação de JWT ou autenticação simples entre microserviços do projeto — use padrões padrão de token.
- Projetos que não utilizam Microsoft Entra ou Azure AD como provedor de identidade.

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

Por que NÃO usar:
- Quando você já sabe exatamente qual skill precisa — acione-a diretamente sem etapa de descoberta.
- Para buscar ferramentas fora do ecossistema de skills do agente (bibliotecas npm, pacotes NuGet) — use os gerenciadores de pacote nativos.
- Quando o catálogo (este documento) já lista a skill adequada para a situação.

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

Por que NÃO usar:
- Revisão de código backend (APIs, banco, lógica de negócio) — a skill foca exclusivamente em interface visual e UX.
- Infraestrutura e DevOps (Docker, CI/CD, nginx) — não há critérios de design relevantes.
- Quando a tarefa é apenas funcional ("o botão chama a API certa?") sem preocupação estética ou de acessibilidade.

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

Por que NÃO usar:
- Construção de APIs REST comuns para o e-commerce — use ecom-services-architecture para padrões de endpoint.
- Quando a integração pode ser feita com chamada HTTP direta sem necessidade de protocolo MCP.
- Consumo de servidores MCP prontos — a skill é para construir, não para configurar uso de servidores já existentes.

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

Por que NÃO usar:
- Uso das skills existentes — a skill-creator é para criar/editar skills, não para executá-las.
- Documentação do projeto acadêmico (contexto.md, backend-apis.md) — use os templates da ETAPA correspondente.
- Quando a convenção já está registrada em ecom-services-architecture e não precisa virar skill separada.

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

Por que NÃO usar:
- Implementação de código de aplicação (APIs, frontend, testes) — a skill é sobre configuração de agente, não sobre o produto.
- Quando a alteração é simples (ex: trocar uma linha no CLAUDE.md) e não exige revisão de frontmatter ou regras de escopo.
- Problemas de runtime do VS Code ou extensões — a skill trata de arquivos de instrução, não de debug do editor.

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
