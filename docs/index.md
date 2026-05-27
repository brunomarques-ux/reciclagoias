# Documentação · Recicla Goiás

## Metadados

- Status: aprovado
- Última atualização: 2026-05-26
- Responsável: UX
- Tipo: guia
- Escopo: porta de entrada da documentação do projeto Recicla Goiás (UX em código).

## Referências relacionadas

- Documentos relacionados:
  - [Visão geral do projeto](./project/overview.md)
  - [Filosofia do Design System](./design-system/progression.md)
  - [Changelog](./changelog/CHANGELOG.md)

- Componentes relacionados:
  - RgButton, RgStatCard, RgFeatureCard, RgSectionHeader
  - Snowflakes da landing (`src/components/landing/`)

- Páginas relacionadas:
  - LandingPage (`/`)

## Este documento afeta

- Onboarding de novos colaboradores;
- Navegação geral do projeto;
- Identificação rápida de onde está cada decisão registrada.

## Este documento é afetado por

- Criação ou remoção de novas categorias de documentação;
- Alteração nos documentos principais (overview, progression, changelog).

---

## Como esta documentação é organizada

A pasta `docs/` cresce **progressivamente**, conforme o projeto evolui. Esta é a entrega inicial — apenas o essencial para começar a colaborar sem perder contexto.

### Visão de projeto

- [`project/overview.md`](./project/overview.md) — o que é o Recicla Goiás, quem usa, por que existe e qual é o escopo deste protótipo.

### Design System

- [`design-system/progression.md`](./design-system/progression.md) — filosofia de evolução: tokens existem, componentes nascem por uso real, snowflakes são aceitos, espelhamento no Figma virá depois.

### Histórico

- [`changelog/CHANGELOG.md`](./changelog/CHANGELOG.md) — Keep a Changelog + SemVer.

---

## Categorias previstas para crescer ao longo do projeto

Cada uma vai surgir naturalmente conforme a necessidade aparecer. Nenhuma é obrigatória nesta entrega inicial:

- `project/architecture.md` — quando a arquitetura ganhar nuances que não são óbvias do código.
- `project/users-and-flows.md` — quando começarmos a desenhar os fluxos internos do sistema.
- `design-system/tokens.md` — referência didática dos tokens (hoje os arquivos `.css` são autoexplicativos).
- `design-system/typography.md` — quando a escala tipográfica evoluir significativamente.
- `design-system/figma-mirror.md` — quando começarmos a espelhar o DS no Figma.
- `components/<Nome>.md` — quando um componente ficar complexo o bastante para merecer documentação dedicada.
- `pages/<nome>.md` — para páginas grandes com decisões editoriais relevantes.
- `decisions/ADR-XXXX-*.md` — para decisões arquiteturais que mereçam registro durável.

## Cabeçalho padrão

Todo novo documento deve começar com o cabeçalho usado neste arquivo: **Metadados**, **Referências relacionadas**, **Este documento afeta**, **Este documento é afetado por**. O conteúdo vem depois.
