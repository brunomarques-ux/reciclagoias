# Changelog

## Metadados

- Status: aprovado
- Última atualização: 2026-05-26
- Responsável: UX
- Tipo: guia
- Escopo: histórico de mudanças relevantes do Recicla Goiás (UX em código).

## Referências relacionadas

- Documentos relacionados:
  - [Índice da documentação](../index.md)
  - [Visão geral do projeto](../project/overview.md)
  - [Filosofia do Design System](../design-system/progression.md)

## Este documento afeta

- Comunicação de mudanças para stakeholders;
- Rastreabilidade de decisões ao longo do tempo;
- Versionamento semântico do protótipo.

## Este documento é afetado por

- Cada release significativa do protótipo;
- Mudanças na direção visual ou de stack;
- Adição/remoção de componentes do DS.

---

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) + [SemVer](https://semver.org/lang/pt-BR/).

## [0.1.0] · 2026-05-26

### Adicionado
- Scaffold do projeto: Vue 3 + Vite 6 + TypeScript (strict) + Vuetify 3 + Pinia + Vue Router 4.
- Fundação de **Design Tokens** em CSS variables, em duas camadas (primitivas + semânticas), cobrindo: cores (brand, neutros, feedback, materiais), tipografia (Inter Variable + Roboto Flex Variable), espaçamento (base 4px), radius, sombras (4 níveis + inset + ring de foco), motion (durations + easings).
- Tema Vuetify customizado (`src/design-system/vuetify-theme.ts`) com cores mapeadas para as primitivas brand e defaults globais para `VBtn`, `VCard`, `VChip`, `VTextField`, `VSelect`, `VExpansionPanel`.
- **4 componentes reutilizáveis** iniciais:
  - `RgButton` (variantes primary/secondary/outline/ghost · sizes sm/md/lg · loading/disabled/icon prepend e append);
  - `RgStatCard` (tons brand/neutral/paper/plastic/metal/glass · 3 sizes · delta + ícone);
  - `RgFeatureCard` (variantes plain/numbered);
  - `RgSectionHeader` (eyebrow + título + descrição · align left/center · tone default/inverse).
- **Mocks centralizados** em `src/data/mocks/landing.ts` cobrindo estatísticas do painel, passos do processo, benefícios, perfis de usuário, FAQ, secretarias parceiras e declarações recentes (todos os dados claramente fictícios).
- **Landing page completa** (`src/pages/LandingPage.vue`) com 10 seções: header sticky com drawer mobile, hero com painel ilustrativo, sobre, como funciona, benefícios, prévia de dados, perfis de usuário, FAQ accordion, CTA final escuro, footer institucional com placeholder de marca Goiás.
- Documentação mínima: `docs/index.md`, `docs/project/overview.md`, `docs/design-system/progression.md` e este changelog.
- `README.md`, `.gitignore`, `.nvmrc`, `.npmrc`, `tsconfig.json` strict, `vite.config.ts` com plugin Vuetify e alias `@`.
- Suporte a `prefers-reduced-motion` global.

### Pendente (próximos ciclos)
- Espelhamento do Design System no Figma (Primitives, Semantic Tokens, Text Styles, primeiros componentes).
- Padronização de família de Tabelas, Dialogs e Formulários.
- Telas internas (dashboard, certificados, massa por operador, gestão de usuários).
- Showcase `/design-system` interno.
- Calibração final WCAG AA das cores de materiais (papel/plástico/metal/vidro).
- Logos institucionais oficiais (Recicla Goiás SVG, brasão Goiás, secretarias) — hoje há placeholders identificados.
- GitHub Actions de lint/typecheck/build em PRs.
- Storybook (quando o DS amadurecer).
