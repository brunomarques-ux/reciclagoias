<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import RgButton from '@/components/RgButton.vue';

interface NavSection {
  id: string;
  label: string;
  /** Marca o item como atalho destacado (ex.: Autodeclaração — prazo aberto). */
  highlight?: boolean;
}

const props = defineProps<{ sections: NavSection[] }>();

const scrolled = ref(false);
const overHero = ref(false);
const drawerOpen = ref(false);
/** ID da section atualmente "ativa" no viewport — usado pra destacar o
 *  link correspondente na nav. Atualizado via IntersectionObserver. */
const activeSectionId = ref<string | null>(null);

let heroObserver: IntersectionObserver | null = null;
let sectionsObserver: IntersectionObserver | null = null;

function onScroll() {
  scrolled.value = window.scrollY > 16;
}

/**
 * Intercepta cliques nos links da navegação pra fazer scroll suave em vez do
 * "teleporte" instantâneo do anchor link nativo. O offset do header fixo é
 * tratado via `scroll-margin-top` definido em globals.css.
 */
async function onNavClick(ev: MouseEvent, hash: string) {
  // Permite Ctrl/Cmd+click ou middle-click pra abrir em nova aba (comportamento default).
  if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
  const target = document.getElementById(hash);
  if (!target) return; // link quebrado → deixa o browser tratar
  ev.preventDefault();
  // Bug fix: se o hero ainda está travado (`overflow-y: hidden` no <html>),
  // o scrollIntoView não funciona. Despachamos um evento que o hero escuta
  // pra soltar o lock e aguardamos 2x rAF (Vue reage ao watch + DOM aplica
  // a remoção da classe) antes de scrollar.
  if (document.documentElement.classList.contains('rg-hero-locked')) {
    window.dispatchEvent(new CustomEvent('rg:expand-hero'));
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Atualiza a URL sem refresh nem reposicionamento do scroll.
  if (history.pushState) history.pushState(null, '', `#${hash}`);
  drawerOpen.value = false;
}

onMounted(async () => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Esperar o próximo tick + um RAF para garantir que o hero já está montado no DOM.
  await nextTick();
  requestAnimationFrame(() => {
    const heroEl = document.querySelector('[data-rg-hero]');
    if (heroEl) {
      overHero.value = true;
      heroObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) overHero.value = entry.intersectionRatio > 0.3;
        },
        { threshold: [0, 0.3, 0.6, 1] },
      );
      heroObserver.observe(heroEl);
    }

    // ============ Active section tracking ============
    // Observa cada section[id] referenciada na nav. A section "mais visível"
    // (maior intersectionRatio) ganha o estado ativo, destacando o link
    // correspondente na nav superior.
    const sectionEls = props.sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionEls.length > 0) {
      // Estado interno do observer: ratios por ID, recalcula o "vencedor" a
      // cada callback.
      const ratios = new Map<string, number>();
      sectionsObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            ratios.set(entry.target.id, entry.intersectionRatio);
          }
          // Acha o ID com maior ratio (mas só se passar de um threshold mínimo
          // pra evitar "ativar" sections que mal apareceram).
          let bestId: string | null = null;
          let bestRatio = 0.15;
          for (const [id, ratio] of ratios) {
            if (ratio > bestRatio) {
              bestRatio = ratio;
              bestId = id;
            }
          }
          activeSectionId.value = bestId;
        },
        {
          // Vários thresholds = updates suaves conforme cada section entra/sai.
          threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
          // Considera só a parte central do viewport — evita ativar sections
          // que estão saindo no topo ou entrando no fundo.
          rootMargin: '-80px 0px -40% 0px',
        },
      );
      sectionEls.forEach((el) => sectionsObserver?.observe(el));
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);
  heroObserver?.disconnect();
  sectionsObserver?.disconnect();
});
</script>

<template>
  <header
    :class="[
      'rg-app-header',
      { 'rg-app-header--scrolled': scrolled, 'rg-app-header--over-hero': overHero && !scrolled },
    ]"
  >
    <div class="rg-app-header__inner">
      <a href="#top" class="rg-app-header__brand" aria-label="Recicla Goiás — início">
        <img
          src="/brand/recicla-logo-horizontal.svg"
          alt="Recicla Goiás"
          class="rg-app-header__brand-logo"
        />
      </a>

      <nav class="rg-app-header__nav" aria-label="Principal">
        <a
          v-for="section in sections"
          :key="section.id"
          :href="`#${section.id}`"
          :class="[
            'rg-app-header__link',
            {
              'is-active': activeSectionId === section.id,
              'rg-app-header__link--highlight': section.highlight,
            },
          ]"
          :aria-current="activeSectionId === section.id ? 'location' : undefined"
          @click="onNavClick($event, section.id)"
        >{{ section.label }}</a>
      </nav>

      <div class="rg-app-header__ctas">
        <RgButton variant="primary" size="sm" href="#acessar" icon-right="mdi-arrow-right">
          Acessar sistema
        </RgButton>
      </div>

      <button
        type="button"
        class="rg-app-header__menu-toggle"
        aria-label="Abrir menu"
        :aria-expanded="drawerOpen"
        @click="drawerOpen = true"
      >
        <v-icon icon="mdi-menu" size="24" />
      </button>
    </div>

    <v-navigation-drawer
      v-model="drawerOpen"
      temporary
      location="right"
      width="320"
    >
      <div class="rg-app-header__drawer">
        <nav class="rg-app-header__drawer-nav" aria-label="Mobile">
          <a
            v-for="section in sections"
            :key="section.id"
            :href="`#${section.id}`"
            :class="[
              'rg-app-header__drawer-link',
              { 'rg-app-header__drawer-link--highlight': section.highlight },
            ]"
            @click="onNavClick($event, section.id)"
          >
            {{ section.label }}
            <v-icon icon="mdi-chevron-right" size="18" />
          </a>
        </nav>

        <div class="rg-app-header__drawer-ctas">
          <RgButton variant="outline" block href="#acessar" @click="drawerOpen = false">
            Cadastrar-se
          </RgButton>
          <RgButton
            variant="primary"
            block
            href="#acessar"
            icon-right="mdi-arrow-right"
            @click="drawerOpen = false"
          >
            Acessar sistema
          </RgButton>
        </div>
      </div>
    </v-navigation-drawer>
  </header>
</template>

<style scoped>
.rg-app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 30;
  /* Efeito glass / frosted (frosted glass + subtle saturation boost). */
  background-color: rgba(255, 255, 255, 0.62);
  backdrop-filter: saturate(180%) blur(22px);
  -webkit-backdrop-filter: saturate(180%) blur(22px);
  border-bottom: 1px solid transparent;
  transition:
    background-color var(--rg-motion-duration-slow) var(--rg-motion-ease-emphasized),
    backdrop-filter var(--rg-motion-duration-slow) var(--rg-motion-ease-emphasized),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-app-header--scrolled {
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(28px);
  -webkit-backdrop-filter: saturate(180%) blur(28px);
  border-bottom-color: rgba(15, 23, 42, 0.06);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.6) inset,
    0 6px 24px rgba(15, 23, 42, 0.06);
}

.rg-app-header__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  /* Padding-y reduzido de 12px → 8px pra compensar o aumento da logo (28→36px)
     mantendo a altura total da navbar em ~52px. A logo fica um pouquinho
     mais perto das beiradas top/bottom, conforme combinado. */
  padding: var(--rg-space-2) var(--rg-space-6);
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: var(--rg-space-6);
  align-items: center;
}

.rg-app-header__brand {
  display: inline-flex;
  align-items: center;
}

/* Logo SVG horizontal Recicla Goiás. Altura 36px — maior que a versão
   anterior (28px) pra ficar legível inclusive a palavra "Goiás" pequena.
   Largura escala proporcionalmente (ratio nativo ~2.83:1 → ~102px).
   A altura total da navbar é mantida via redução do padding-y do __inner. */
.rg-app-header__brand-logo {
  display: block;
  height: 36px;
  width: auto;
  /* Em modo "over hero" (fundo escuro) aplicamos filter pra logo ficar visível. */
  transition: filter var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-app-header__nav {
  display: flex;
  gap: var(--rg-space-1);
  justify-self: center;
}

.rg-app-header__link {
  position: relative;
  /* Vertical 10px (fora da escala de 4px de propósito): meio-termo calibrado
     no feedback — 8px ficava colado, 12px sobrava. Itens fecham em 43px e o
     header em 60px (1px borda + 2×8px inner + 43px). Se mudar, atualizar o
     `top` do RgScrollProgress, que cola na base do header. */
  padding: 10px var(--rg-space-3);
  border-radius: var(--rg-radius-md);
  /* Borda transparente na base: o item destacado ganha borda visível sem
     alterar a altura/alinhamento dos demais links. */
  border: 1px solid transparent;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
  transition: color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
              background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
              border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}
.rg-app-header__link:hover {
  color: var(--rg-color-text-primary);
  background-color: var(--rg-color-surface-muted);
}

/* Estado ativo — link da section atualmente visível no viewport ganha
   destaque verde brand (texto + leve fundo + sublinhado animado). */
.rg-app-header__link.is-active {
  color: var(--rg-primitive-brand-700);
  background-color: var(--rg-primitive-brand-50);
  font-weight: var(--rg-font-weight-semibold);
}
.rg-app-header__link.is-active::after {
  content: '';
  position: absolute;
  left: var(--rg-space-3);
  right: var(--rg-space-3);
  bottom: 2px;
  height: 2px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-500);
}

/* Atalho destacado (Autodeclaração · prazo aberto). Usa o âmbar do badge
   "Prazo aberto" do disclaimer pra sinalizar item sazonal/urgente, sem
   competir com o verde brand do estado ativo. Definido depois de .is-active
   pra prevalecer caso a section esteja simultaneamente ativa no viewport. */
.rg-app-header__link--highlight {
  color: #B45309;
  background-color: rgba(252, 211, 77, 0.16);
  border-color: rgba(252, 211, 77, 0.55);
  font-weight: var(--rg-font-weight-semibold);
}
.rg-app-header__link--highlight:hover {
  color: #92400E;
  background-color: rgba(252, 211, 77, 0.28);
}

.rg-app-header__ctas {
  display: flex;
  gap: var(--rg-space-2);
  align-items: center;
}

/* Override dos RgButtons no header: força fonte Inter (Vuetify às vezes
   injeta Roboto nas camadas internas do v-btn) e fixa a altura em 43px —
   mesma altura computada do chip "Autodeclaração" (14px × lh 1.5 + 2×10px
   de padding + 2×1px de borda), pros dois fecharem na mesma caixa. */
.rg-app-header__ctas :deep(.rg-button.v-btn),
.rg-app-header__ctas :deep(.rg-button .v-btn__content) {
  font-family: var(--rg-font-family-sans) !important;
}
.rg-app-header__ctas :deep(.rg-button.v-btn) {
  height: 43px !important;
  min-height: 43px !important;
  font-size: var(--rg-font-size-sm);
}

.rg-app-header__menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-md);
  color: var(--rg-color-text-primary);
  cursor: pointer;
}

.rg-app-header__drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: var(--rg-space-6) var(--rg-space-5);
  gap: var(--rg-space-5);
}
.rg-app-header__drawer-nav {
  display: flex;
  flex-direction: column;
}
.rg-app-header__drawer-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--rg-space-4) 0;
  border-bottom: 1px solid var(--rg-color-border-subtle);
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-primary);
}

/* Atalho destacado no drawer mobile: texto âmbar + semibold (leve destaque). */
.rg-app-header__drawer-link--highlight {
  color: #B45309;
  font-weight: var(--rg-font-weight-semibold);
}
.rg-app-header__drawer-ctas {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  margin-top: auto;
}

@media (max-width: 960px) {
  .rg-app-header__inner {
    grid-template-columns: auto 1fr auto;
    gap: var(--rg-space-3);
  }
  .rg-app-header__nav,
  .rg-app-header__ctas {
    display: none;
  }
  .rg-app-header__menu-toggle {
    display: inline-flex;
  }
}

/* ---------- Modo "over hero" (background escuro/vídeo) ---------- */
.rg-app-header--over-hero {
  background-color: transparent;
  backdrop-filter: none;
  border-bottom-color: transparent;
  box-shadow: none;
}

/* Over hero (fundo escuro): a logo SVG é colorida em tons verdes; aplicamos
   um filter brightness + saturate pra deixar ela mais clara/legível sobre
   o brand-950 sem perder a identidade. */
.rg-app-header--over-hero .rg-app-header__brand-logo {
  filter: brightness(1.6) saturate(0.85);
}

.rg-app-header--over-hero .rg-app-header__link {
  color: rgba(255, 255, 255, 0.82);
}
.rg-app-header--over-hero .rg-app-header__link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Estado ativo no over-hero: fundo verde brand mais visível + texto branco
   e sublinhado em brand-300 (mais claro pra contrastar com o fundo escuro). */
.rg-app-header--over-hero .rg-app-header__link.is-active {
  color: white;
  background-color: rgba(31, 131, 68, 0.32);
}
.rg-app-header--over-hero .rg-app-header__link.is-active::after {
  background-color: var(--rg-primitive-brand-300);
}

/* Atalho destacado sobre o hero escuro: âmbar mais claro pra contrastar. */
.rg-app-header--over-hero .rg-app-header__link--highlight {
  color: #FCD34D;
  background-color: rgba(252, 211, 77, 0.16);
  border-color: rgba(252, 211, 77, 0.5);
}
.rg-app-header--over-hero .rg-app-header__link--highlight:hover {
  color: white;
  background-color: rgba(252, 211, 77, 0.28);
}

.rg-app-header--over-hero .rg-app-header__menu-toggle {
  color: white;
  border-color: rgba(255, 255, 255, 0.25);
  background-color: rgba(255, 255, 255, 0.06);
}

/* Ghost button "Cadastrar-se" muda para branco sobre fundo escuro */
.rg-app-header--over-hero :deep(.rg-button--ghost) {
  color: rgba(255, 255, 255, 0.88) !important;
}
.rg-app-header--over-hero :deep(.rg-button--ghost:hover) {
  background-color: rgba(255, 255, 255, 0.12) !important;
  color: white !important;
}
</style>
