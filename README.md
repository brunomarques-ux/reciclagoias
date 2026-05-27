# Recicla Goiás

Protótipo de **UX em código** para o **Recicla Goiás (SISLOG Reversa)** — sistema do Governo de Goiás para gestão da logística reversa e rastreabilidade de massa reciclável.

Este repositório **não é** o sistema de produção. É a camada onde o time de UX desenha, testa e refina a experiência diretamente em código, com dados mockados, antes de levar para o sistema real.

## Stack

- **Vue 3** + **Vite 6** + **TypeScript** (strict)
- **Vuetify 3** como engine de componentes (com defaults customizados pelos tokens)
- **Pinia** + **Vue Router 4**
- **Inter Variable** + **Roboto Flex Variable** servidas via `@fontsource`
- **CSS Variables** como única fonte da verdade para cores, tipografia, espaçamento, radius, sombras e motion
- Sem Tailwind, sem backend, sem APIs — tudo mockado

## Como rodar localmente

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # produção em dist/
pnpm preview    # serve o build em http://localhost:4173
pnpm typecheck  # vue-tsc --noEmit
```

Pré-requisitos: Node ≥ 20, pnpm ≥ 10.

## Estrutura

```
src/
├─ design-system/      tokens (CSS variables) + tema Vuetify
├─ components/         RgButton, RgStatCard, RgFeatureCard, RgSectionHeader (DS reutilizável)
│  └─ landing/         snowflakes da landing (Header, Hero, About, ...)
├─ data/mocks/         dados mockados centralizados
├─ pages/              LandingPage.vue
├─ router/             configuração de rotas
├─ styles/             reset + import de fontes
├─ plugins/            inicialização do Vuetify
├─ App.vue
└─ main.ts

docs/
├─ index.md
├─ project/overview.md
├─ design-system/progression.md
└─ changelog/CHANGELOG.md
```

## Filosofia

- **Zero hardcode no Design System**: cor, spacing, radius, sombra e motion vêm sempre de `var(--rg-*)` ou do tema Vuetify.
- **Componentes reutilizáveis nascem por uso real**, não por organização especulativa. Tudo muito específico vira *snowflake* (pasta `components/landing/`).
- **Documentação progressiva**: o que importa hoje é o `docs/index.md`, o `overview`, a `progression` do DS e o `CHANGELOG`. Outros docs nascem conforme o produto evolui.
- **Acessibilidade desde o início**: HTML semântico, contraste WCAG AA, foco visível, `prefers-reduced-motion` respeitado.

## Deploy

Configurado para **Vercel** (preset Vite detectado automaticamente). Cada PR ganha um preview deploy.

## Documentação

Comece por [`docs/index.md`](docs/index.md).

---

Mantido pela equipe de UX em colaboração com a Secretaria de Indústria e Comércio do Estado de Goiás.
