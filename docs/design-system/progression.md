# Filosofia do Design System

## Metadados

- Status: aprovado
- Última atualização: 2026-05-26
- Responsável: UX
- Tipo: guia
- Escopo: princípios de evolução do Design System do Recicla Goiás — o que existe hoje, o que vem depois, e que regras seguimos para não cair em overengineering.

## Referências relacionadas

- Documentos relacionados:
  - [Índice da documentação](../index.md)
  - [Visão geral do projeto](../project/overview.md)
  - [Changelog](../changelog/CHANGELOG.md)

- Componentes relacionados:
  - `src/components/RgButton.vue`
  - `src/components/RgStatCard.vue`
  - `src/components/RgFeatureCard.vue`
  - `src/components/RgSectionHeader.vue`
  - Snowflakes em `src/components/landing/`

- Tokens relacionados:
  - `src/design-system/tokens/primitives.css`
  - `src/design-system/tokens/semantic.css`
  - `src/design-system/tokens/typography.css`
  - `src/design-system/tokens/spacing.css`
  - `src/design-system/tokens/radius.css`
  - `src/design-system/tokens/shadows.css`
  - `src/design-system/tokens/motion.css`
  - `src/design-system/vuetify-theme.ts`

## Este documento afeta

- Decisões de organização da pasta `src/components/`;
- Critérios para criar ou recusar um novo componente reutilizável;
- Regras de uso de tokens vs. valores ad-hoc;
- Como evoluir o DS sem perder a aderência ao Figma (quando o espelhamento começar).

## Este documento é afetado por

- Mudanças na direção visual do produto;
- Necessidades emergentes durante o redesign de telas internas;
- Decisão de instalar o Storybook;
- Início do espelhamento no Figma.

---

## Princípio 1 · Tokens são lei

Todo componente do DS lê **cor, espaçamento, radius, sombra, motion e tipografia** de `var(--rg-*)` ou do tema Vuetify. Nunca escreve valor literal. Esta é uma regra dura.

Estrutura em duas camadas:

- **Primitivas** (`primitives.css`): hex puro, escalas numéricas. Não são consumidas por componentes.
- **Semânticas** (`semantic.css`): apenas referenciam primitivas. **Esta** é a camada que páginas e componentes consomem.

Categorias hoje cobertas: cores (surface, text, border, action, feedback, data/material), tipografia (family, size, line-height, weight, letter-spacing), espaçamento (base 4px), radius, sombras (elevation 1–4 + inset + ring de foco), motion (durations + easings).

## Princípio 2 · A landing pode usar valores ad-hoc, conscientes

A landing é um espaço **editorial e snowflake**. Composições específicas (gradiente do bloco escuro, tamanho do hero, dimensões de painéis ilustrativos) podem usar valores ad-hoc desde que:

1. estejam dentro de um snowflake (`src/components/landing/`), não de um componente do DS;
2. tenham um comentário curto quando o valor for surpreendente;
3. **não** entrem nos tokens só porque "talvez sejam reutilizados depois".

Tudo que vier a ser reutilizado pode entrar em tokens *depois*, quando o segundo uso aparecer.

## Princípio 3 · Componentes nascem por uso real

Não criamos `RgX` porque seria "organizado". Criamos quando:

- o mesmo padrão aparece em ≥ 2 lugares **reais** do produto, ou
- vai aparecer em telas que **já estão no roadmap imediato**.

A landing levou ao nascimento de 4 reutilizáveis (`RgButton`, `RgStatCard`, `RgFeatureCard`, `RgSectionHeader`). Tudo mais que foi específico — hero, FAQ, footer, perfis — ficou como snowflake.

Componentes provisórios podem amadurecer dentro de `landing/` e *subir* para `components/` quando ganharem variantes claras de reuso.

## Princípio 4 · Vuetify é a engine, os defaults são nossos

Vuetify é obrigatório porque o sistema de produção usa Vuetify. Aqui ele entra como **engine de componentes complexos** (tabelas, dialogs, forms, accordions, drawers) com **defaults nossos** configurados em `src/design-system/vuetify-theme.ts` (height, rounded, density, variant, color).

Os wrappers `Rg*` não são reinvenção do Vuetify — são **decoração tipada e estilizada** dos componentes Vuetify, garantindo que o produto fale a mesma língua sem cada uso precisar repetir 8 props.

## Princípio 5 · Acessibilidade não é depois

Toda criação no DS já considera:

- HTML semântico (`button`, `header`, `nav`, `section`, etc);
- estados `:hover`, `:focus-visible`, `disabled`;
- foco visível derivado de `--rg-color-action-primary`;
- contraste mínimo WCAG AA;
- `prefers-reduced-motion` respeitado em animações;
- atributos ARIA quando o tipo do elemento exigir.

Se um componente nasce sem isso, ele não está pronto para entrar no DS.

## Roadmap progressivo

A primeira família operacional que vamos padronizar (em ciclo posterior a esta landing):

1. **Tabelas** — densidade, paginação, ordenação, chips de status, ações por linha.
2. **Dialogs / Modais** — confirmação, formulário, full-screen mobile.
3. **Formulários** — inputs, select, file upload, validação, regra de "salvar habilita só com mudança".
4. **Filtros** — barra superior padrão para listagens.
5. **Empty states** + **loading skeletons** consistentes.

Cada família emerge no momento em que atacarmos a primeira tela que a exigir, e fica documentada aqui.

## Espelhamento no Figma

Vai começar **depois** da landing já validada. O plano é criar dentro do arquivo `Recicla_v2` páginas dedicadas: `Primitives`, `Semantic Tokens`, `Text Styles`, `Atoms`, `Molecules`, `Organisms`, `Templates`. Sempre via Auto Layout, sempre usando variáveis (nada hardcoded no Figma também).

Enquanto isso, o Figma fica como espaço de referência e descobertas; o código é a fonte da verdade.

## Quando instalar o Storybook

Quando tivermos:

- ≥ 6 componentes reutilizáveis com variantes;
- 1ª família operacional padronizada (tabelas) usando esses componentes;
- demanda concreta de stakeholders querendo navegar pelo DS isoladamente.

Antes disso, o próprio app + esta documentação são suficientes.
