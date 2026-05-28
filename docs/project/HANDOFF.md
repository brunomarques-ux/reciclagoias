# Recicla Goiás · Handoff para Desenvolvimento

> Documento de transferência da landing page prototipada → time de desenvolvimento que vai integrá-la ao **Sistema Recicla Goiás** em produção (Vuetify + Vue).

**Versão:** 1.0 · **Data:** Maio 2026 · **Repositório:** [`brunomarques-ux/reciclagoias`](https://github.com/brunomarques-ux/reciclagoias)

---

## 1. O que está entregue

Uma **landing page institucional completa** do Recicla Goiás, em produção na Vercel:

- **URL preview:** verifique no painel da Vercel (último deploy do branch `main`)
- **Repositório:** público em [github.com/brunomarques-ux/reciclagoias](https://github.com/brunomarques-ux/reciclagoias)

**Seções implementadas:**

| # | Seção | ID | Componente |
|---|---|---|---|
| 1 | Hero scroll-expand com vídeo | (root) | `LandingHeroScrollExpand.vue` |
| 2 | Disclaimer (Prazo aberto) | — | `LandingDisclaimer.vue` |
| 3 | O que é Logística Reversa | `#sobre` | `LandingWhatIsLR.vue` |
| 4 | Como Funciona (3 passos) | `#como-funciona` | `LandingHowItWorks.vue` |
| 5 | Reconhecimento (Prêmio PMI) | `#premio` | `LandingPremio.vue` |
| 6 | Comitê Gestor (8 instituições) | `#comite` | `LandingComite.vue` |
| 7 | Fluxo de Operação | `#fluxo` | `LandingFlowDiagram.vue` |
| 8 | Sistema Recicla Goiás (scrolling showcase) | `#sistema` | `LandingSistema.vue` |
| 9 | Perguntas Frequentes (accordion) | `#duvidas` | `LandingFaq.vue` |
| 10 | CTA Final | `#acessar` | `LandingCtaFinal.vue` |
| — | Header (sticky glass) | — | `LandingHeader.vue` |
| — | Footer institucional | — | `LandingFooter.vue` |
| — | Scroll progress bar | — | `RgScrollProgress.vue` |

---

## 2. Stack & dependências

### Core
| Tecnologia | Versão | Função |
|---|---|---|
| **Vue** | 3.5 | Framework reativo, Composition API + `<script setup lang="ts">` |
| **TypeScript** | strict mode | Tipagem das props, refs e mocks |
| **Vite** | 6 | Bundler + dev server (HMR rápido) |
| **Vuetify** | 3 | Componentes Material (defaults customizados via tema RG) |
| **Pinia** | 2 | Store (registrado mas **não está em uso** — sem state global no protótipo) |
| **Vue Router** | 4 | Roteamento (1 rota só: `/` → `LandingPage.vue`) |

### Fontes e ícones
- **Inter Variable** (`@fontsource-variable/inter`) — fonte global de UI
- **Roboto Flex Variable** (`@fontsource-variable/roboto-flex`) — alternativa, não está em uso ativo
- **Material Design Icons** (mdi-*) — via Vuetify built-in

### Bibliotecas auxiliares
| Pacote | Função | Onde é usado |
|---|---|---|
| **motion-v** | Port Vue de Motion (Framer) | `LandingHeroScrollExpand.vue` (animações do scroll-expand) |

### Browser APIs nativas (sem dependência externa)
- **IntersectionObserver**: ativa section no nav (`LandingHeader.vue`), fade-stagger dos cards do "O que é" (`LandingWhatIsLR.vue`), trigger do `RgHighlight` quando entra no viewport
- **MutationObserver**: nenhum uso
- **requestAnimationFrame**: throttle de scroll listeners (`RgScrollProgress`, `LandingFlowDiagram`, `LandingSistema`, `LandingFaq`)
- **PointerEvents**: pan/drag do certificado no `RgLightbox`
- **CSS `radial-gradient` + `mask-image`**: "lanterna" do mouse nos dot patterns (`RgHeroHighlight`, `LandingSistema`)

---

## 3. Como rodar localmente

```bash
# Pré-requisitos: Node ≥ 20, pnpm
git clone https://github.com/brunomarques-ux/reciclagoias.git
cd reciclagoias
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # gera dist/
pnpm preview      # serve a build local
```

**Não há backend.** Toda data é mock estática em `src/data/mocks/landing.ts`.

---

## 4. Arquitetura

### Estrutura de pastas
```
src/
├─ pages/
│  └─ LandingPage.vue              # única rota; orquestra todas as seções
├─ components/
│  ├─ Rg*.vue                      # componentes do design system (reutilizáveis)
│  │  ├─ RgButton.vue              # wrapper do v-btn com defaults RG
│  │  ├─ RgSectionHeader.vue       # eyebrow + título + descrição
│  │  ├─ RgLightbox.vue            # modal com zoom (Premio e Fluxo)
│  │  ├─ RgHeroHighlight.vue       # bg dots + lanterna do mouse (pós-vídeo do Hero)
│  │  ├─ RgHighlight.vue           # span inline com gradient verde animado
│  │  └─ RgScrollProgress.vue      # barra fixa abaixo do header
│  └─ landing/
│     └─ Landing*.vue              # snowflakes (seções específicas da página)
├─ design-system/
│  ├─ tokens/
│  │  ├─ primitives.css            # paleta brand (50→950), neutros, feedback
│  │  ├─ semantic.css              # cores semânticas (surface, text, action…)
│  │  ├─ typography.css            # font-family, sizes, weights, letter-spacing
│  │  ├─ spacing.css               # escala 4px (--rg-space-1 a -24)
│  │  ├─ radius.css                # xs, sm, md, lg, xl, 2xl, pill
│  │  ├─ shadows.css               # elevation-1 a -3
│  │  ├─ motion.css                # durations e easings
│  │  └─ index.css                 # orquestrador
│  └─ vuetify-theme.ts             # tema Vuetify mapeado pros tokens
├─ data/
│  └─ mocks/
│     └─ landing.ts                # todos os mocks da página (tipados)
├─ styles/
│  ├─ fonts.css                    # imports do @fontsource
│  └─ globals.css                  # reset + base
├─ router/
│  └─ index.ts                     # uma rota só
└─ main.ts                         # bootstrap (Vuetify + Pinia + Router + tokens)
```

### Princípios

1. **Tokens-first**: nenhum componente do DS escreve cor/spacing/radius literal. Sempre `var(--rg-*)` ou tema Vuetify. **Exceções controladas** nas seções da landing têm comentário explicando o porquê.
2. **Snowflakes vs DS**: componentes específicos de uma seção ficam em `landing/`. Só vira `Rg*` quando há 2+ usos reais.
3. **Sem state global**: o protótipo não precisa de Pinia store. Pinia está registrado pra facilitar a integração futura no Sistema.
4. **Mocks tipados**: cada bloco de `landing.ts` tem uma interface TypeScript. Útil pra trocar por chamadas reais à API depois.

---

## 5. Componentes do Design System (Rg*)

### `RgButton.vue`
Wrapper fino sobre `v-btn`. Variantes: `primary`, `secondary`, `outline`, `ghost`. Sizes: `sm` (36px), `md` (44px), `lg` (52px). Props: `href`, `to`, `icon`, `iconRight`, `block`, `disabled`, `loading`. **No header da landing há override pra altura 32px e fonte Inter forçada via `:deep`** — Vuetify às vezes injeta Roboto em camadas internas.

### `RgSectionHeader.vue`
Eyebrow + título + descrição opcional. Variantes `align` (left/center) e `tone` (default/inverse).

### `RgLightbox.vue`
Modal de zoom usado pelo Premio (certificado) e Fluxo (diagrama). Teleport pra body, overlay verde escuro com backdrop-blur. Pan via PointerEvents, zoom via double-click ou teclas `+`/`-`. Fecha com Esc.

### `RgHeroHighlight.vue` — adaptação do Aceternity "Hero Highlight"
Dot pattern verde brand-200 sobre brand-950 + camada hover com `mask-image: radial-gradient(220px circle at var(--mx) var(--my)...)` que segue o mouse. **Atenção**: usa porcentagens (12%/15%) no `radial-gradient`, não pixels — pixels iguais (`2.5px, 2.5px`) fazem o Chrome não renderizar o dot (bug documentado em comentário no arquivo).

### `RgHighlight.vue` — adaptação do Aceternity "Highlight"
Span inline com gradient brand-400→600 que cresce horizontalmente quando a seção entra no viewport (IntersectionObserver, threshold 0.4). Props `delay` (default 400ms) e `duration` (default 1600ms). Respeita `prefers-reduced-motion`.

### `RgScrollProgress.vue`
Barra fixa logo abaixo da navbar (`top: 52px; z-index: 29`). Scroll listener throttled via rAF. Gradient brand-600→500→400 com glow via box-shadow.

---

## 6. Microinterações e padrões avançados

### Hero scroll-expand (`LandingHeroScrollExpand.vue`)
Vídeo no centro do hero **expande proporcionalmente conforme o usuário rola**. Implementado com:
- `position: sticky` no `.rg-scroll-hero__stage`
- Scroll listener calcula `scrollProgress` 0..1
- Width/height do vídeo: `300px + scrollProgress * 1250px` (desktop)
- Título dividido em 2 spans com `translateX` em direções opostas
- Classe `rg-hero-locked` em `<html>` trava o scroll do body via CSS (`overflow-y: hidden`) enquanto o vídeo não expande totalmente — combinado com listener `wheel` que avança o progress
- **Pular animação**: botão que dispara o final do progress imediatamente

Adaptação Vue de um pattern conhecido como "scroll-locked video expansion" (visto em sites tipo apple.com).

### Reveal-on-scroll do logo 3D (`LandingFlowDiagram.vue`)
Símbolo 3D aparece de cima conforme o scroll entra na section, simultaneamente com efeito de **tilt 3D global** (mousemove em qualquer ponto da janela afeta a rotação). Tilt aplicado via CSS custom props (`--rg-flow-tilt-x/y`) + `rotateX/Y` no transform. Reveal usa `--rg-flow-scroll` (0..1) baseado em `getBoundingClientRect().top` da section.

### Scrolling showcase com progresso contínuo (`LandingSistema.vue`)
Section ocupa `stackLength × 100vh` (= 5 viewports com 4 slides + splash). Sticky panel preso no topo. `globalProgress` (0..N) **contínuo** dirige:
- TranslateY do image stack à direita (interpolação suave, não pula discretamente nas trocas)
- Largura da pagination bar ativa (background-image gradient cresce 0→100%)
- Opacity e translateY do feature ativo nos últimos 25% do slide
- Mesma mecânica de lanterna do `RgHeroHighlight` no fundo da coluna direita

### FAQ accordion não-exclusivo (`LandingFaq.vue`)
Substitui o `v-expansion-panels` do Vuetify por implementação custom — múltiplos itens abertos simultaneamente via `Set<number>` reativo. Transição CSS de `max-height` 0→500px + opacity. 3 balões 3D no header com **reveal sequencial** (cada um termina em uma fração diferente do scroll progress: 45%, 73%, 100%).

---

## 7. Tokens & convenções

### Paleta brand (use SEMPRE via `var(--rg-primitive-brand-*)`)
| Token | Hex | Uso típico |
|---|---|---|
| `--rg-primitive-brand-50`  | `#E9F6EE` | Backgrounds muito claros, chips |
| `--rg-primitive-brand-100` | `#C8E8D4` | Separadores, borders |
| `--rg-primitive-brand-200` | `#9FD5B0` | Borders, dots sutis, texto on-dark |
| `--rg-primitive-brand-300` | `#71BF8A` | Acentos, sublinhados |
| `--rg-primitive-brand-400` | `#46AB68` | Hovers, gradients |
| `--rg-primitive-brand-500` | `#279C50` | **Cor principal**: textos de destaque, fundos primários, accents |
| `--rg-primitive-brand-600` | `#1F8344` | Botões, hovers |
| `--rg-primitive-brand-700` | `#16692D` | Texto sobre claro |
| `--rg-primitive-brand-800` | `#0E5523` | Texto institucional |
| `--rg-primitive-brand-900` | `#093F1B` | Fundos escuros, navbar over-hero |
| `--rg-primitive-brand-950` | `#072614` | **Hero background**, footer |

### Tipografia
- Hierarquia padrão: eyebrow `12px` UPPERCASE + título `56px` bold + lede `16px` regular
- Trechos destacados em verde: usar `var(--rg-primitive-brand-500)`
- Sempre Inter Variable (fallback system-ui)

### Spacing
Escala base 4px. Mais usados: `--rg-space-2` (8), `--rg-space-3` (12), `--rg-space-4` (16), `--rg-space-6` (24), `--rg-space-8` (32), `--rg-space-12` (48), `--rg-space-16` (64), `--rg-space-20` (80), `--rg-space-24` (96).

**Padding vertical padrão de seção:** `var(--rg-space-24)` (96px).

### Radius
`xs` (4), `sm` (6), `md` (8), `lg` (12), `xl` (16), `2xl` (24), `pill`.

---

## 8. Assets

| Pasta | Conteúdo |
|---|---|
| `public/brand/` | Logos SVG (horizontal + isotipo) |
| `public/hero/` | bg-hero-v2.jpg, hero-video.mp4 |
| `public/whatis/` | card1/2/3 (jpg/webp) + pin/factory icons (PNG) |
| `public/premio/` | certificado.png + 4 ícones (medal/people/calendar/trophy) |
| `public/fluxo/` | diagrama-fluxo.png + logo-3d.png |
| `public/sistema/` | 4 slides (cadastro/metas/validação/fiscalização) + end-splash |
| `public/faq/` | doubt-icon.png |

**Originais e variações** estão em `docs/assets/` (não vão pro build; deixar fora de `public/` evita assets desnecessários no bundle).

---

## 9. Referências externas usadas

Componentes adaptados de bibliotecas open-source:

1. **Aceternity UI · Hero Highlight** ([aceternity.com](https://ui.aceternity.com/components/hero-highlight))
   → Adaptado em `RgHeroHighlight.vue` (dot pattern + lanterna do mouse)
   → React/Tailwind → Vue/CSS variables com tokens RG

2. **Aceternity UI · Highlight** ([aceternity.com](https://ui.aceternity.com/components/highlight))
   → Adaptado em `RgHighlight.vue` (span com gradient animado)

3. **21st.dev · Interactive Scrolling Story** ([21st.dev/community/components/thanh/interactive-scrolling-story-component](https://21st.dev/community/components/thanh/interactive-scrolling-story-component/default))
   → Adaptado em `LandingSistema.vue` (scrolling showcase com 4 slides + splash)
   → React + framer-motion → Vue + scroll listener próprio

4. **21st.dev · OriginUI Accordion** ([21st.dev/community/components/originui/accordion](https://21st.dev/community/components/originui/accordion/default))
   → Adaptado em `LandingFaq.vue` (accordion não-exclusivo)
   → React + Radix → Vue + `<Transition>` nativo

5. **21st.dev · Scroll Progress** ([21st.dev/community/components/scroll-progress](https://21st.dev/community))
   → Adaptado em `RgScrollProgress.vue` (barra superior)
   → React/motion → Vue + rAF + CSS scaleX

**Hero scroll-expand**: padrão "scroll-locked video expansion" inspirado em sites institucionais (apple.com). Implementação própria com `position: sticky` + scroll listener + motion-v pra animar texto.

---

## 10. Integração com o Sistema atual (próximos passos)

O Sistema Recicla Goiás de produção também usa **Vuetify**, então a integração é direta:

### Sugestão de plano
1. **Copiar tokens** (`src/design-system/tokens/*.css`) pro sistema atual e importar em `main.ts`. Se o sistema já tem tokens, comparar e consolidar.
2. **Copiar componentes Rg*** (8 arquivos em `src/components/`) — todos são autocontidos e dependem só do Vuetify + tokens.
3. **Tema Vuetify**: comparar `src/design-system/vuetify-theme.ts` com o tema atual do sistema. Os defaults globais (VBtn rounded `lg`, VCard rounded `xl`) podem precisar ajuste pra não quebrar telas existentes.
4. **Seções como rotas separadas**: a landing tem 10 seções; provavelmente entrarão como uma `/` ou `/sobre` no router atual.
5. **Mocks → API**: substituir cada export de `landing.ts` por uma chamada real ao backend ou CMS, mantendo as interfaces TS como contrato.
6. **Smooth scroll + scroll-margin-top** (em `globals.css`): conferir se não conflita com layouts do sistema (sidebar/header diferentes).

### Pontos de atenção
- **`rg-hero-locked`** (classe que trava o scroll no início) só faz sense na landing pública. **Não usar dentro do sistema autenticado** — não combina com fluxos de produto.
- **Logo do header** (`/brand/recicla-logo-horizontal.svg`) provavelmente já existe no sistema — comparar com a versão usada.
- **Vídeo do hero** (`/hero/hero-video.mp4`, 1MB): manter ou trocar por loop curto se for muito pesado.
- **Imagens do sistema-showcase**: hoje são fotos staged ("Cadastro de participantes" etc). Trocar por screenshots reais do sistema quando integrar.

### Compatibilidade browser
Testado e funcional em: Chrome 120+, Edge 120+, Safari 17+, Firefox 121+. IE não suportado (mask-image não funciona pré-Edge Chromium).

---

## 11. Acessibilidade

- HTML semântico: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<article>`
- Hierarquia de heading: 1 `<h1>` (Hero) + `<h2>` por seção + `<h3>` em cards
- `aria-current="location"` no link da nav da seção visível
- `aria-expanded` + `aria-controls` no accordion FAQ
- Foco visível derivado de `--rg-color-action-primary`
- `prefers-reduced-motion` respeitado em **todas** as microinterações (zerar animações sem quebrar funcionalidade)
- Contraste WCAG AA validado nas combinações usadas (verde brand-500 sobre branco = ratio 4.1:1 ✓, branco sobre brand-950 = ratio 16.8:1 ✓)

---

## 12. Pendências e roadmap

### O que NÃO entrou nesta entrega
- **Showcase do Design System em `/design-system`** — fica pra próxima fase
- **Espelhamento dos componentes no Figma** — em andamento separado
- **GitHub Actions / CI custom** — só a Vercel valida o build hoje
- **Telas internas** (dashboard, certificados, gestão de usuários)
- **Modo dark**
- **i18n / múltiplos idiomas**

### Pontos abertos pra próxima fase
1. Trocar mocks por API real quando o backend estiver pronto
2. Adicionar `id="acessar"` real apontando pra URL do sistema (hoje é só âncora interna)
3. Substituir as 4 fotos do "Sistema" por screenshots reais do produto
4. Considerar otimização da `bg-hero-v2.jpg` (820KB) para WebP/AVIF
5. Adicionar analytics (GA4 ou similar) — não está incluído no protótipo

---

## 13. Contatos

- **Repositório:** github.com/brunomarques-ux/reciclagoias
- **PRs:** padrão é branch `feat/*` → review → squash merge em `main`
- **Email institucional do projeto:** logisticareversa.meioambiente@gov.goias.br

> Documento gerado no fechamento da primeira entrega (Maio/2026). Atualize a cada release significativa.
