<script setup lang="ts">
/**
 * Seção Reconhecimento — premiações modulares (N prêmios).
 *
 * Dois níveis na mesma seção, sem modal:
 *   nível 1 — listagem de cards (LandingPremioCard), grid auto-fill;
 *   nível 2 — detalhe in-place (LandingPremioDetail) com botão voltar.
 *
 * A troca usa <Transition mode="out-in"> + animação de altura do viewport
 * via hooks JS: before-leave trava a altura atual em px, @enter mede o
 * offsetHeight do novo conteúdo (out-in garante que o anterior já saiu) e
 * after-enter libera pra auto. ESC volta pra lista; foco vai pro título do
 * detalhe ao entrar e devolve pro card de origem ao voltar; se o topo da
 * seção ficou acima do header após a troca, re-ancora com scrollIntoView.
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { awards } from '@/data/mocks/landing';
import LandingPremioCard from './LandingPremioCard.vue';
import LandingPremioDetail from './LandingPremioDetail.vue';

const sectionRef = ref<HTMLElement | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
const detailRef = ref<InstanceType<typeof LandingPremioDetail> | null>(null);

// ============ Estado list/detail ============
const selectedSlug = ref<string | null>(null);
const selected = computed(
  () => awards.find((a) => a.slug === selectedSlug.value) ?? null,
);
/** Slug do card que originou a navegação — devolve o foco no voltar. */
let lastCardSlug: string | null = null;

function select(slug: string) {
  lastCardSlug = slug;
  selectedSlug.value = slug;
}

function goBack() {
  selectedSlug.value = null;
}

// ESC fecha o detalhe — listener só existe enquanto o detalhe está aberto.
function onKeydown(ev: KeyboardEvent) {
  if (ev.key !== 'Escape') return;
  // Lightbox aberto tem precedência: o ESC fecha só ele (listener próprio
  // do RgLightbox) — sem este guard, um único ESC fechava os dois níveis.
  if (document.querySelector('.rg-lightbox')) return;
  goBack();
}

watch(selectedSlug, (slug) => {
  if (slug) window.addEventListener('keydown', onKeydown);
  else window.removeEventListener('keydown', onKeydown);
});

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============ Animação de altura do viewport na troca ============
function lockViewportHeight() {
  const vp = viewportRef.value;
  if (!vp || prefersReducedMotion()) return;
  vp.style.height = `${vp.offsetHeight}px`;
  vp.classList.add('is-swapping');
}

function onSwapEnter(el: Element) {
  const vp = viewportRef.value;
  if (!vp || prefersReducedMotion()) return;
  // out-in: o conteúdo anterior já desmontou — o offsetHeight do novo
  // elemento é a altura final. rAF garante layout aplicado antes de animar.
  requestAnimationFrame(() => {
    vp.style.height = `${(el as HTMLElement).offsetHeight}px`;
  });
}

function onSwapAfterEnter() {
  const vp = viewportRef.value;
  if (vp) {
    vp.style.height = '';
    vp.classList.remove('is-swapping');
  }

  // Foco: detalhe → título; lista → botão do card de origem.
  if (selected.value) {
    detailRef.value?.focusHeading();
  } else if (lastCardSlug) {
    sectionRef.value
      ?.querySelector<HTMLElement>(
        `[data-award-slug="${lastCardSlug}"] .rg-premio-card__btn`,
      )
      ?.focus({ preventScroll: true });
  }

  // Scroll anchoring: voltar de um detalhe longo pra lista curta pode
  // deixar o viewport além da seção — re-ancora no topo (o scroll-margin-top
  // de 88px do globals.css compensa o header fixo).
  const top = sectionRef.value?.getBoundingClientRect().top;
  if (top !== undefined && top < 0) {
    sectionRef.value?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}

// ============ Reveal-on-enter dos cards da listagem ============
const isVisible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (prefersReducedMotion()) {
    isVisible.value = true;
    return;
  }
  if (!sectionRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        isVisible.value = true;
        observer?.disconnect();
      }
    },
    { threshold: 0.25 },
  );
  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <section
    id="premio"
    ref="sectionRef"
    :class="['rg-premio', { 'is-visible': isVisible }]"
    aria-labelledby="rg-premio-title"
  >
    <div class="rg-premio__inner">
      <!-- Header enxuto da seção — o conteúdo rico vive no detalhe -->
      <header class="rg-premio__header">
        <div class="rg-premio__copy">
          <span class="rg-premio__eyebrow">RECONHECIMENTO</span>
          <h2 id="rg-premio-title" class="rg-premio__title">
            <span class="rg-premio__title-line">
              Prêmios
              <img
                src="/premio/trophy-icon.png"
                alt=""
                aria-hidden="true"
                class="rg-premio__trophy"
              />
              que contam
            </span>
            <span class="rg-premio__title-line rg-premio__title-brand">
              essa história
            </span>
          </h2>
        </div>
        <p class="rg-premio__desc">
          O Recicla Goiás vem sendo reconhecido dentro e fora do governo.
          Selecione um prêmio para conhecer os detalhes de cada conquista.
        </p>
      </header>

      <!-- Viewport da troca list/detail: altura animada via hooks JS -->
      <div ref="viewportRef" class="rg-premio__viewport">
        <Transition
          name="rg-premio-swap"
          mode="out-in"
          @before-leave="lockViewportHeight"
          @enter="onSwapEnter"
          @after-enter="onSwapAfterEnter"
        >
          <ul v-if="!selected" key="list" class="rg-premio__grid" role="list">
            <li
              v-for="(a, i) in awards"
              :key="a.slug"
              class="rg-premio__grid-item"
              :style="{ '--rg-card-i': i } as Record<string, string | number>"
              :data-award-slug="a.slug"
            >
              <LandingPremioCard :award="a" @select="select(a.slug)" />
            </li>
          </ul>

          <LandingPremioDetail
            v-else
            ref="detailRef"
            :key="selected.slug"
            :award="selected"
            @back="goBack"
          />
        </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-premio {
  position: relative;
  /* Padding vertical 96px — 16px a mais pra respiro entre seções. */
  padding: var(--rg-space-24) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
}

.rg-premio__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-10);
}

/* ============ Header ============ */
.rg-premio__header {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1fr);
  align-items: end;
  gap: var(--rg-space-16);
}

.rg-premio__copy {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
}

.rg-premio__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-premio__title {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  font-size: 48px;
  line-height: 1.05;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.rg-premio__title-line {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: var(--rg-space-3);
  white-space: nowrap;
}

.rg-premio__title-brand {
  color: var(--rg-primitive-brand-700);
}

.rg-premio__trophy {
  width: 56px;
  height: 56px;
  object-fit: contain;
  flex: none;
  display: inline-block;
  vertical-align: middle;
}

.rg-premio__desc {
  margin: 0;
  /* Encosta o bloco na direita da coluna e alinha o texto à direita, mesmo
     padrão da lede de Perfis / Como funciona (textos à direita da página). */
  margin-left: auto;
  max-width: 44ch;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
  text-align: right;
}

/* ============ Viewport da troca list/detail ============ */
.rg-premio__viewport.is-swapping {
  overflow: hidden;
  /* Mesma duração do enter do conteúdo — altura e fade terminam juntos. */
  transition: height 280ms var(--rg-motion-ease-emphasized);
}

/* Conteúdo: leave rápido (accelerate), enter com ênfase (emphasized). */
.rg-premio-swap-enter-active {
  transition:
    opacity 280ms var(--rg-motion-ease-emphasized),
    transform 280ms var(--rg-motion-ease-emphasized);
}

.rg-premio-swap-leave-active {
  transition:
    opacity 180ms var(--rg-motion-ease-accelerate),
    transform 180ms var(--rg-motion-ease-accelerate);
}

.rg-premio-swap-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.rg-premio-swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ============ Grid da listagem ============ */
.rg-premio__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--rg-space-6);
}

/* Reveal-on-enter com stagger 120ms (mesmo padrão dos cards do "O que é"). */
.rg-premio__grid-item {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.7s cubic-bezier(0.2, 0, 0, 1),
    transform 0.7s cubic-bezier(0.2, 0, 0, 1);
  transition-delay: calc(var(--rg-card-i, 0) * 120ms);
}

.rg-premio.is-visible .rg-premio__grid-item {
  opacity: 1;
  transform: translateY(0);
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-premio__header {
    grid-template-columns: 1fr;
    align-items: start;
    gap: var(--rg-space-4);
  }
  /* Empilhado: o texto volta a alinhar à esquerda, no fluxo natural. */
  .rg-premio__desc {
    margin-left: 0;
    text-align: left;
  }
  .rg-premio__title { font-size: clamp(32px, 6vw, 44px); }
  .rg-premio__title-line {
    flex-wrap: wrap;
    white-space: normal;
  }
  .rg-premio__trophy {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 640px) {
  .rg-premio {
    padding: var(--rg-space-14) var(--rg-space-4);
  }
  .rg-premio__grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-premio__grid-item,
  .rg-premio-swap-enter-active,
  .rg-premio-swap-leave-active,
  .rg-premio__viewport.is-swapping {
    transition: none !important;
  }
}
</style>
