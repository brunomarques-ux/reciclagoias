# Recicla Goiás — Landing Page · Hand-off de Desenvolvimento

Documento de transferência para o time de desenvolvimento. Descreve a
arquitetura, o sistema de design, cada seção (conteúdo, animações, estados
alternativos, responsividade e acessibilidade), os pontos de integração e o
que hoje é mock e precisa ser conectado a dado real.

> **Stack:** Vue 3 (Composition API, `<script setup>`) · TypeScript · Vuetify 3 · Vite 6 · pnpm · deploy Vercel.

---

## 1. Como rodar

```bash
pnpm install
pnpm dev        # servidor de desenvolvimento (Vite) em http://localhost:5173
pnpm typecheck  # vue-tsc --noEmit
pnpm build      # build de produção em dist/
pnpm preview    # serve o build
```

Entry point da página: `src/pages/LandingPage.vue` (importa e ordena todas as seções).

---

## 2. Papel do Vuetify (importante)

A UI **não** é construída com componentes visuais do Vuetify. O visual inteiro
usa **CSS próprio + design tokens** (variáveis `--rg-*`). O Vuetify entra
apenas em três pontos:

| Uso | Onde | Observação |
|-----|------|-----------|
| `v-icon` (ícones MDI) | em todas as seções | toda iconografia é Material Design Icons via `v-icon`. |
| `v-btn` | dentro de `RgButton.vue` | o `RgButton` encapsula o `v-btn` e aplica os tokens. Use sempre o `RgButton`, não o `v-btn` cru. |
| `v-navigation-drawer` | `LandingHeader.vue` | menu mobile (drawer lateral). |

**Não reescrever as seções em componentes Vuetify** (v-card, v-container, etc.).
O padrão do projeto é markup semântico + classes com tokens. Manter assim.

---

## 3. Design System / Tokens

Tokens em `src/design-system/tokens/*.css` (carregados via `index.css`). Sempre
consumir por `var(--rg-*)`, nunca hex hardcoded.

- **Cor — marca (verde):** `--rg-primitive-brand-50 … 950`. CTA principal = `brand-600` (`#1F8344`).
- **Cor — neutros (slate):** `--rg-primitive-neutral-0 … 950`.
- **Cor — feedback:** amber (warning), red (danger), blue (info), emerald (success).
- **Semânticas:** `--rg-color-surface-*`, `--rg-color-text-*`, `--rg-color-action-*`, `--rg-color-border-*`. Inclui `--rg-color-surface-soft-tint` (`#F1F7F3`) = fundo verde-clarinho que alterna entre seções.
- **Tipografia:** família Inter (`--rg-font-family-sans`); escala `--rg-font-size-2xs … 6xl`; pesos `--rg-font-weight-*`; line-heights e letter-spacings tokenizados.
- **Espaçamento:** base 4px — `--rg-space-1 … 24`.
- **Raio:** `--rg-radius-xs … 3xl`, `pill`.
- **Sombra:** `--rg-elevation-1 … 4`, `--rg-ring-focus`.
- **Motion:** durações `--rg-motion-duration-instant|fast|base|slow|slower`; easings `--rg-motion-ease-standard|emphasized|decelerate|accelerate`.
- **Container:** `--rg-container-page` (1200px) = largura editorial padrão das seções.

### Componentes reutilizáveis (`src/components/`)

| Componente | Função | Props principais |
|-----------|--------|------------------|
| `RgButton.vue` | botão padrão (wrapper do v-btn) | `variant` (primary/secondary/outline/ghost), `size` (sm/md/lg), `href`, `to`, `icon`, `iconRight`, `block`, `loading` |
| `RgLightbox.vue` | amplia imagem em overlay (ESC fecha) | `v-model`, `imageSrc`, `imageSrcWebp`, `alt` |
| `RgExpandTransition.vue` | transição de altura **real** (mede o DOM) | wrapper de `<Transition>`; usado no acordeão do FAQ |
| `RgScrollProgress.vue` | barra de progresso de scroll colada à base do header | — |
| `RgSectionHeader.vue` | header de seção (eyebrow + título + descrição) | `eyebrow`, `title`, `description`, `align`, `tone` |
| `RgHighlight.vue` | marca-texto animado (gradiente) | `delay`, `duration` |

---

## 4. Padrões transversais (valem para todas as seções)

- **Reveal-on-enter:** a maioria das seções anima na entrada via `IntersectionObserver` (threshold ~0.2–0.35) que adiciona uma classe (`is-visible` / `is-animating`) no elemento raiz; o CSS faz o resto com `transition`/`animation` + `transition-delay` para stagger.
- **`prefers-reduced-motion`:** **obrigatório** em toda animação nova. Quando reduzido, o componente seta o estado final direto no `onMounted` e um bloco `@media (prefers-reduced-motion: reduce)` zera `transition`/`animation`. Replicar esse padrão em qualquer animação futura.
- **Breakpoints:** `960px` (empilhamento principal desktop→tablet), `768px` (ajustes intermediários), `640px` (mobile). O header usa `960px` para trocar nav ↔ drawer.
- **Scroll/âncoras:** navegação é via âncoras (`#id`); `scroll-margin-top: 88px` global (em `globals.css`) compensa o header fixo. O scroll suave é interceptado no `LandingHeader` (trata o lock do hero).
- **Acessibilidade:** seções usam `aria-labelledby`; o quiz e o FAQ têm `aria-live`; tablist de Perfis segue o padrão WAI-ARIA Tabs (roving tabindex, setas); foco programático nas trocas de estado (quiz, prêmios).

---

## 5. Dados (mocks) — o que conectar ao backend

**Tudo** que é conteúdo dinâmico está centralizado em `src/data/mocks/landing.ts`
(interfaces TS + exports nomeados por seção). Hoje são constantes; ao integrar,
trocar por fetch/CMS mantendo as mesmas interfaces:

| Export | Seção | Vira API? |
|--------|-------|-----------|
| `whatIsCards` | O que é | conteúdo editorial (provável estático) |
| `systemProfiles` + `profileCycle` | Perfis | estático (texto do decreto) |
| `eligibilityQuestions` / `eligibilityResults` / `eligibilitySanctions` / `eligibilityExceptions` | Enquadramento (quiz) | regras de negócio — validar com jurídico |
| `howItWorksSteps` | Como funciona | estático |
| `awards` | Prêmios | **provável CMS** (cresce com o tempo) |
| `committeeMembers` / `institutionalPartners` | Comitê / Footer | estático |
| `systemFeatures` + `systemDescription` | Sistema | estático |
| `faqItems` | FAQ | **provável CMS** (cresce; ~21 hoje) |

**Pontos de integração externos:**
- CTA "Acessar sistema" → `href="#acessar"` (hoje âncora; trocar pela URL real do sistema).
- "Cadastrar-se" (drawer) → idem.
- Autodeclaração → `#autodeclaracao` (banner sazonal) e botão da seção Enquadramento.
- Contato (footer): `mailto:logisticareversa.meioambiente@gov.goias.br` + WhatsApp.

---

## 6. Header — `LandingHeader.vue` (fixo)

- **Conteúdo:** logo (SVG horizontal, largura fixa 102px) · nav central com **5 âncoras** (O que é · Perfis · Quem adere · Como funciona · Dúvidas) · grupo de ações à direita (chip **Autodeclaração** sazonal + botão **Acessar sistema**).
- **Estados:** transparente sobre o hero (`--over-hero`, texto claro) → glass/branco ao rolar (`--scrolled`). Link da seção ativa destacado (verde) via `IntersectionObserver` que observa as `section[id]`.
- **Autodeclaração é sazonal:** vive no grupo de ações (não na nav). Quando o prazo fechar, remover o elemento `.rg-app-header__seasonal` (e o link equivalente no drawer) — comentário no código marca isso. Não afeta a navegação.
- **Mobile (≤960px):** nav e ações somem; aparece o menu hambúrguer → `v-navigation-drawer` com as 5 âncoras + Autodeclaração (destacada) + CTAs no rodapé do drawer.
- **A11y:** `aria-current="location"` no link ativo; drawer com foco gerenciado pelo Vuetify.

---

## 7. Seções (ordem de render no `LandingPage.vue`)

### 7.1 Hero — `LandingHeroScrollExpand.vue` (`#top`)
- **Conteúdo:** vídeo/imagem de fundo, eyebrow, título "RECICLA GOIÁS", subtítulo, CTA secundário "Conhecer o processo", hint "Role para descobrir".
- **Animação:** abre travado (overflow do `<html>` bloqueado) e "expande" no primeiro scroll; o card de mídia cresce. Há botão "Pular animação".
- **Estado alternativo:** se o usuário clica numa âncora com o hero ainda travado, um evento (`rg:expand-hero`) solta o lock antes de rolar.
- **Mobile:** mídia em card vertical; CTAs full-width.

### 7.2 Disclaimer — `LandingDisclaimer.vue` (`#autodeclaracao`)
- **Conteúdo:** banner sazonal "Prazo aberto" → Formulário de Autodeclaração de Não Enquadramento, com CTA.
- **Animação:** o CTA tem **pulso** infinito (`box-shadow` expandindo, 2.4s) — é a referência visual reutilizada na tab ativa de Perfis. Pausa no hover.
- **Estado alternativo / sazonalidade:** seção inteira é removível quando o período de autodeclaração encerra.

### 7.3 O que é — `LandingWhatIsLR.vue` (`#sobre`)
- **Conteúdo:** header (eyebrow + título com ícones inline + card "Acessar Decreto") · 3 cards com foto (`whatIsCards`).
- **Animação:** cards entram com fade + translateY, **stagger** de 120ms.
- **Mobile:** cards empilham; imagem com `aspect-ratio` fixo.

### 7.4 Perfis do sistema — `LandingPerfis.vue` (`#perfis`)
Espelha o component set **"Seção Perfis do Sistema"** (Figma). É a seção mais rica em interação.
- **Conteúdo:** header split (heading à esquerda; lede à direita com fio verde, base alinhada) · **seletor (tablist)** de 4 perfis · **painel** de detalhe (descrição + badge + lista "O que faz no sistema") · **ciclo de operação** (pista oval / racetrack).
- **Estados alternativos:** 4 perfis (`empresa`, `gestora`, `operador`, `verificador`). Trocar a tab troca: painel inteiro + badge (tom **âmbar** = restrição/prazo legal, **verde** = integridade de processo) + **anel aceso nos nós do ciclo** correspondentes àquele perfil.
- **Animações:**
  - Entrada: heading desliza da esquerda, lede da direita (fade); tabs surgem em sequência (Empresa já ativa); a pista **se desenha** (`stroke-dashoffset`) e os nós dão pop com stagger.
  - Tab ativa: **anel neon pulsando** (mesmo padrão do CTA do disclaimer).
  - Troca de painel: `<Transition mode="out-in">` com **fade puro**.
  - Ciclo: **pulso de energia** percorre o path em loop infinito (`offset-path`, 12s/volta); cada nó **pisca** quando o pulso passa (delay sincronizado pela fração do perímetro). Clicar num nó ativa o perfil.
- **Geometria da pista:** SVG 1200×396 com coordenadas absolutas (offset-path exige isso); escalada via `transform: scale()` para caber no container. Constantes no `<script>` (`TRACK_PATH`, `NODE_GEO`).
- **Mobile (≤768px):** a pista vira **timeline vertical** (mesmos blinks sequenciais, sem o ponto viajante). Tabs em grade 2×2; ≤640px tab compacta (ícone + nome, sem tagline).

### 7.5 Enquadramento — `LandingEnquadramento.vue` (`#enquadramento`)
- **Conteúdo:** grid 2 colunas — esquerda: copy (heading + lede) + card "Foi notificado e não se enquadra?" (atalho autodeclaração, **encostado na base**, alinhado com a base do card do quiz); direita: **card do quiz** (destaque verde). Abaixo do grid: **hint** "Resultado orientativo" (bullet discreto à direita) e box de **exceções** (largura total, itens em 3 colunas com ícone).
- **Estados alternativos (máquina do quiz):** 3 perguntas Sim/Não com *early-exit* → 3 resultados: `enquadra` (warning + box de sanções), `nao-enquadra` (success), `ja-atende` (info). Cada resultado tem tom, ícone, CTA e texto próprios. Botão "Refazer verificação" reseta.
- **Animações:**
  - Entrada: copy desliza da esquerda, quiz da direita; card notificado e exceções sobem com fade; itens das exceções com stagger.
  - Troca de pergunta/resultado: `<Transition mode="out-in">` slide-fade horizontal.
  - Foco programático: ao trocar, foca a nova pergunta / o título do resultado (anunciado por `aria-live`).
- **Botões do quiz:** Sim/Não são **outline verde** (borda 2px brand-700); ações do resultado em largura total com `space-between` (primário à esquerda, "Refazer" à direita).
- **Mobile:** grid empilha; exceções 1 coluna; hint volta a alinhar à esquerda; botões Sim/Não empilham.
- **Microdisclaimer:** o quiz é orientativo, não parecer jurídico (texto fixo no hint).

### 7.6 Como funciona — `LandingHowItWorks.vue` (`#como-funciona`)
- **Conteúdo:** header split · 3 passos numerados conectados por linha tracejada que preenche · 3 cards descritivos (`howItWorksSteps`).
- **Animação:** timeline sequencial complexa disparada na entrada (bullets crescem, linhas preenchem `scaleX`, checks dão pop, cards sobem; seta final pulsa em loop). Toda via CSS `animation-delay`.
- **Mobile (≤760px):** a faixa de bullets some; ficam só os cards empilhados.

### 7.7 Prêmios — `LandingPremio.vue` (+ `LandingPremioCard`, `LandingPremioDetail`) (`#premio`)
Espelha o component set **"Seção Prêmios"** (Figma).
- **Conteúdo:** header enxuto + **listagem** de cards de prêmios (`awards`). Nível 2 = **detalhe in-place**.
- **Estados alternativos:** `Listagem` ⇄ `Detalhe` (por prêmio). Hoje 2 prêmios: PMI Goiás 2025 e Goiás Sustentável 2026.
- **Animações / comportamento:** clicar "Ver detalhes" troca lista→detalhe com `<Transition mode="out-in">` + **altura do viewport animada** (hooks JS medem o `offsetHeight`). Botão voltar e **ESC** retornam à lista. Gerência de foco (entra no h3 do detalhe; volta pro card de origem). **Scroll anchoring** evita salto ao voltar de um detalhe longo. A imagem do detalhe amplia no `RgLightbox`.
- **Escalável:** mais um objeto em `awards[]` = mais um card automaticamente (grid `auto-fill`).
- **Mobile:** cards 1 coluna; detalhe empilha.

### 7.8 Comitê — `LandingComite.vue` (`#comite`)
- **Conteúdo:** header ("Construído com 8 instituições do Estado de Goiás") + lista de instituições (`committeeMembers`): nome + sigla (pill) + link externo. **Sem ícones** à esquerda; linhas separadas por divisor.
- **Animação:** contador 0→8 (~2s) sincronizado com o reveal de cada linha (pop + fade).
- **Mobile:** linhas reorganizam (nome em cima, sigla embaixo), divisor fino.

### 7.9 Fluxo de operação — `LandingFlowDiagram.vue` (`#fluxo`)
- **Conteúdo:** header + logo 3D (com leve tilt no mouse) + **imagem do diagrama** (`/fluxo/diagrama-fluxo-v2.png`). A arte v2 já desenha o próprio card — o wrapper clicável é transparente (sem moldura duplicada).
- **Comportamento:** clique amplia no `RgLightbox`.
- **Mobile:** diagrama responsivo; logo 3D pode ocultar.

### 7.10 Sistema Recicla Goiás — `LandingSistema.vue` (`#sistema`)
Espelha o component set **"Seção Sistema Recicla Goiás"** (Figma, 4 variantes).
- **Conteúdo:** scrolling story showcase — header fixo (sticky) à esquerda; 4 *features* (`systemFeatures`) com ícone/título/descrição que trocam conforme o scroll; imagem (foto do slide) à direita que transita no stack vertical; barra de paginação.
- **Estados alternativos:** 4 passos (Cadastro de participantes · Metas e relatórios · Validação de dados · Fiscalização), cada um com sua foto (`/sistema/slide-*.png`) + 1 splash final.
- **Animação:** a seção ocupa N×100vh; um painel sticky (100vh) atualiza o slide ativo conforme `rect.top` negativo. Imagem translada no eixo Y; pagination cresce continuamente. Clique na pagination → `scrollTo` no offset do slide.
- **Mobile:** simplificar o scroll-driven (testar; pode virar carrossel/empilhado).

### 7.11 FAQ — `LandingFaq.vue` (`#duvidas`)
- **Conteúdo:** header split (copy + balões 3D decorativos + card "Fale Conosco") · **toolbar de busca** + contador · acordeão (`faqItems`, ~21) · botão "Mostrar todas / menos".
- **Estados alternativos:** sem busca → mostra 6 + botão revelar; com busca → filtra o conjunto todo (ignora o limite). **Empty state** quando a busca não acha nada (ilustração + CTA Fale Conosco).
- **Busca:** por tokens, case/acento-insensitive, em pergunta **e** resposta (`utils/textSearch.ts`); highlight dos matches via `<mark>` (sem v-html); item cujo match está só na resposta abre automaticamente.
- **Acordeão:** não-exclusivo (`Set<id>` estável); expand/collapse com `RgExpandTransition` (altura real, sem corte). Estado aberto por `id` (não índice — sobrevive ao filtro).
- **Animações:** balões 3D fazem reveal-on-scroll sequencial; chevron do "revelar" rotaciona.
- **Mobile:** toolbar empilha; balões ocultam.

### 7.12 CTA Final — `LandingCtaFinal.vue` (`#acessar`)
- **Conteúdo:** faixa com eyebrow + título grande ("Pronto para começar a sua jornada de logística reversa?") + botão "Acessar sistema". Sem imagem (o texto é o protagonista).
- **Mobile:** empilha; botão full-width.

### 7.13 Footer — `LandingFooter.vue`
- **Conteúdo:** 4 colunas — brand + descrição · navegação (mapa do site, 9 links) · secretarias parceiras (`institutionalPartners`) · contato. Legal embaixo.
- **Detalhe técnico:** o e-mail é dividido em 2 `<span>` com `white-space: nowrap` → quebra controlada **só no `@`** (nunca parte "gov"). Sem selo de prêmio (removido — a seção Prêmios cobre os reconhecimentos).
- **Mobile:** 4→2→1 colunas.

---

## 8. Assets (`public/`)
- `public/brand/` — logo SVG horizontal.
- `public/hero/` — vídeo + bg do hero.
- `public/whatis/`, `public/premio/`, `public/sistema/`, `public/fluxo/`, `public/faq/` — imagens por seção.
- Certificado do prêmio e diagrama de fluxo já otimizados (PNG + WebP). Originais de alta resolução em `docs/assets/`.

---

## 9. Fonte de verdade no Figma

Arquivo **SisRev - Rascunho**, página **Home**: frame `Home · Recicla Goiás — Junho/26` (desktop) + `· Mobile`. Componentes com variantes em **"Componentes · Recicla Goiás"**:
`Top Bar Navigation` (Desktop / Mobile / Mobile · Menu aberto) · `Quiz Enquadramento` (Pergunta + 3 resultados) · `Seção Sistema Recicla Goiás` (4 passos) · `Seção Prêmios` (Listagem + 2 detalhes) · `Seção Perfis do Sistema` (4 perfis).

---

## 10. Checklist de qualidade (manter ao evoluir)
- [ ] `pnpm typecheck` e `pnpm build` limpos.
- [ ] Toda animação respeita `prefers-reduced-motion`.
- [ ] Sem overflow horizontal em 1440 / 1024 / 768 / 390.
- [ ] Navegação por teclado nas peças interativas (tabs de Perfis, quiz, busca FAQ, ESC nos prêmios/lightbox).
- [ ] Conteúdo novo entra por `landing.ts` (ou pela futura API), nunca hardcoded no template.
- [ ] Texto de UI sem travessões "—" (usar vírgula / dois-pontos / conector).
