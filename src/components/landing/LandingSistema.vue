<script setup lang="ts">
/**
 * Sistema Recicla Goiás — scrolling story showcase.
 *
 * Adaptação do componente React "ScrollingFeatureShowcase" pra Vue +
 * identidade Recicla Goiás. Em vez de scroll interno (overflow-y) usado no
 * original, aproveitamos o scroll da página principal: a section ocupa
 * N × 100vh de altura total e tem um sticky panel ocupando exatamente 100vh.
 *
 * Conforme o usuário scrolla, o slide ativo muda baseado em quanto da section
 * já saiu do topo do viewport (rect.top negativo). O feature da esquerda
 * troca via opacity + translateY; a imagem da direita translada -Y dentro
 * de um stack vertical de altura 400% (4 slides empilhados).
 *
 * Header da seção (eyebrow + título + lede) fica fixo durante todo o scroll,
 * porque vive dentro do sticky panel — visível em todos os slides.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { systemFeatures, systemDescription } from '@/data/mocks/landing';

const sectionRef = ref<HTMLElement | null>(null);
const activeIndex = ref(0);
let rafId: number | null = null;

// Cor de fundo opcional por slide — todos no mesmo tom suave por enquanto.
// Cada feature ganha um tint distinto pro placeholder da imagem mock,
// dando variedade visual sem precisar de imagens reais ainda.
const slideTints = [
  'linear-gradient(135deg, var(--rg-primitive-brand-400), var(--rg-primitive-brand-700))',
  'linear-gradient(135deg, var(--rg-primitive-brand-500), var(--rg-primitive-brand-800))',
  'linear-gradient(135deg, var(--rg-primitive-brand-300), var(--rg-primitive-brand-600))',
  'linear-gradient(135deg, var(--rg-primitive-brand-600), var(--rg-primitive-brand-900))',
];

const features = computed(() =>
  systemFeatures.map((f, i) => ({
    ...f,
    tint: slideTints[i % slideTints.length],
  })),
);

// ============ Scroll → slide ativo ============
function updateActiveSlide() {
  rafId = null;
  const section = sectionRef.value;
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const sectionHeight = section.offsetHeight;
  const viewportHeight = window.innerHeight;
  // Quanto a section já subiu acima do topo do viewport.
  const scrolledIntoSection = -rect.top;
  // Altura efetivamente rolável (a section toda menos o que cabe na tela).
  const totalScrollable = Math.max(1, sectionHeight - viewportHeight);
  // Progresso 0..1
  const progress = Math.max(0, Math.min(1, scrolledIntoSection / totalScrollable));
  // Mapeia em índice 0..features.length-1
  const idx = Math.min(features.value.length - 1, Math.floor(progress * features.value.length));
  if (idx !== activeIndex.value) activeIndex.value = idx;
}

function onScroll() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(updateActiveSlide);
}

// Click na pagination → scrollTo no offset do slide correspondente.
function goToSlide(i: number) {
  const section = sectionRef.value;
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const sectionAbsoluteTop = rect.top + window.scrollY;
  const sectionHeight = section.offsetHeight;
  const viewportHeight = window.innerHeight;
  const totalScrollable = Math.max(1, sectionHeight - viewportHeight);
  const stepHeight = totalScrollable / features.value.length;
  // +1px pra garantir que o `floor()` no progress aterrissa no índice certo
  window.scrollTo({
    top: sectionAbsoluteTop + stepHeight * i + 1,
    behavior: 'smooth',
  });
}

onMounted(() => {
  updateActiveSlide();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateActiveSlide, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', updateActiveSlide);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <section
    id="sistema"
    ref="sectionRef"
    class="rg-sysscroll"
    aria-labelledby="rg-sysscroll-title"
    :style="{ '--rg-sys-total': features.length } as Record<string, string | number>"
  >
    <!-- Sticky panel: ocupa exatamente 1 viewport e fica preso enquanto o
         usuário rola a section inteira (que tem altura N * 100vh). -->
    <div class="rg-sysscroll__sticky">
      <div class="rg-sysscroll__grid">
        <!-- Coluna esquerda: header da seção + pagination + feature ativo -->
        <div class="rg-sysscroll__left">
          <header class="rg-sysscroll__heading">
            <span class="rg-sysscroll__eyebrow">SISTEMA RECICLA GOIÁS</span>
            <h2 id="rg-sysscroll-title" class="rg-sysscroll__title">
              Uma plataforma única para toda a
              <span class="rg-sysscroll__title-accent">cadeia da logística reversa.</span>
            </h2>
            <p class="rg-sysscroll__lede">{{ systemDescription[0] }}</p>
          </header>

          <!-- Pagination bars (ativa = mais larga e escura) -->
          <div
            class="rg-sysscroll__pagination"
            role="tablist"
            aria-label="Navegação entre funcionalidades do sistema"
          >
            <button
              v-for="(f, i) in features"
              :key="f.title"
              type="button"
              role="tab"
              :aria-selected="i === activeIndex"
              :aria-label="`Ir para ${f.title}`"
              :class="['rg-sysscroll__page-bar', { 'is-active': i === activeIndex }]"
              @click="goToSlide(i)"
            />
          </div>

          <!-- Stack do feature ativo: todos empilhados em absolute, opacity
               + translateY transitam entre eles. -->
          <div class="rg-sysscroll__feature-stack">
            <div
              v-for="(f, i) in features"
              :key="f.title"
              :class="['rg-sysscroll__feature', { 'is-active': i === activeIndex }]"
              :aria-hidden="i !== activeIndex"
            >
              <span class="rg-sysscroll__feature-icon" aria-hidden="true">
                <v-icon :icon="f.icon" size="28" />
              </span>
              <h3 class="rg-sysscroll__feature-title">{{ f.title }}</h3>
              <p class="rg-sysscroll__feature-desc">{{ f.description }}</p>
            </div>
          </div>
        </div>

        <!-- Coluna direita: stack de imagens transladado verticalmente.
             Por enquanto, placeholder com gradiente brand + ícone grande +
             título (substituir por imagens reais quando recebermos). -->
        <div class="rg-sysscroll__right" aria-hidden="true">
          <div class="rg-sysscroll__image-frame">
            <div
              class="rg-sysscroll__image-stack"
              :style="{ transform: `translateY(-${activeIndex * 100}%)` }"
            >
              <div
                v-for="f in features"
                :key="f.title"
                class="rg-sysscroll__image-slide"
                :style="{ background: f.tint }"
              >
                <div class="rg-sysscroll__image-mock">
                  <v-icon :icon="f.icon" size="96" />
                  <span class="rg-sysscroll__image-label">{{ f.title }}</span>
                  <span class="rg-sysscroll__image-hint">Mock — substituir por imagem real</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ============ Section: altura total = N viewports ============ */
.rg-sysscroll {
  position: relative;
  /* A section toda ocupa N × 100vh — cada feature "consome" 1 viewport
     de scroll antes do próximo entrar. */
  height: calc(var(--rg-sys-total, 4) * 100vh);
  background-color: var(--rg-color-surface-base);
}

/* Sticky panel que fica preso enquanto a section toda rola pelo viewport. */
.rg-sysscroll__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rg-sysscroll__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  height: 100%;
  width: 100%;
  max-width: var(--rg-container-page);
  margin-inline: auto;
}

/* ============ Coluna esquerda ============ */
.rg-sysscroll__left {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--rg-space-6);
  padding: var(--rg-space-10) var(--rg-space-10);
  border-right: 1px solid var(--rg-color-border-subtle);
}

.rg-sysscroll__heading {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-sysscroll__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-sysscroll__title {
  margin: 0;
  /* Mais compacto que as outras seções porque divide a coluna esquerda com
     o feature ativo que aparece abaixo (precisa caber tudo na viewport). */
  font-size: clamp(36px, 3.4vw, 44px);
  line-height: 1.1;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
  max-width: 18ch;
}

/* Trecho "cadeia da logística reversa." em verde brand-500 — mesmo padrão
   das outras seções (ponta a ponta, 8 instituições, começar, etc.). */
.rg-sysscroll__title-accent {
  color: var(--rg-primitive-brand-500);
}

.rg-sysscroll__lede {
  margin: 0;
  max-width: 50ch;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* ============ Pagination bars ============ */
.rg-sysscroll__pagination {
  display: flex;
  gap: var(--rg-space-2);
}

.rg-sysscroll__page-bar {
  height: 4px;
  width: 24px;
  border: none;
  padding: 0;
  background-color: rgba(15, 23, 42, 0.15);
  border-radius: var(--rg-radius-pill);
  cursor: pointer;
  transition:
    width var(--rg-motion-duration-slow) var(--rg-motion-ease-emphasized),
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-sysscroll__page-bar:hover {
  background-color: rgba(15, 23, 42, 0.32);
}

.rg-sysscroll__page-bar.is-active {
  width: 48px;
  background-color: var(--rg-primitive-brand-500);
}

.rg-sysscroll__page-bar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 4px;
}

/* ============ Stack de features ============ */
.rg-sysscroll__feature-stack {
  position: relative;
  /* Altura fixa porque os items são absolute dentro. Ajusta pra evitar saltos. */
  min-height: 200px;
  max-width: 480px;
}

.rg-sysscroll__feature {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 600ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
  pointer-events: none;
}

.rg-sysscroll__feature.is-active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.rg-sysscroll__feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-primitive-brand-50);
  border: 1px solid var(--rg-primitive-brand-200);
  color: var(--rg-primitive-brand-600);
}

.rg-sysscroll__feature-title {
  margin: 0;
  font-size: var(--rg-font-size-2xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-primitive-brand-900);
  letter-spacing: var(--rg-letter-spacing-tight);
  line-height: var(--rg-line-height-snug);
}

.rg-sysscroll__feature-desc {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* ============ Coluna direita: stack de imagens ============ */
.rg-sysscroll__right {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--rg-space-12);
  /* Grid pattern sutil de fundo, igual ao componente original. */
  background-image:
    linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
  background-size: 56px 56px;
}

.rg-sysscroll__image-frame {
  position: relative;
  width: min(60%, 380px);
  height: min(72vh, 620px);
  border-radius: var(--rg-radius-2xl);
  overflow: hidden;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 24px 48px rgba(15, 23, 42, 0.12);
  border: 4px solid rgba(15, 23, 42, 0.04);
}

.rg-sysscroll__image-stack {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  /* Transição do translateY suave (igual o componente original). */
  transition: transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;
}

/* Cada slide ocupa 100% do frame, empilhados verticalmente.
   O stack tem altura total = N × 100%, e transladamos -100% por slide. */
.rg-sysscroll__image-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Placeholder mock: mostra o ícone gigante + título — pra ser substituído
   por imagens reais quando recebermos do usuário. */
.rg-sysscroll__image-mock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-4);
  width: 100%;
  height: 100%;
  padding: var(--rg-space-8);
  color: white;
  text-align: center;
}

.rg-sysscroll__image-mock :deep(.v-icon) {
  opacity: 0.92;
  filter: drop-shadow(0 8px 24px rgba(15, 23, 42, 0.18));
}

.rg-sysscroll__image-label {
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-sysscroll__image-hint {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  opacity: 0.7;
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-sysscroll {
    /* No mobile reduzimos pra 1 viewport por slide ainda — mas testa antes
       se a UX faz sentido em scroll-touch. */
    height: calc(var(--rg-sys-total, 4) * 100vh);
  }
  .rg-sysscroll__grid {
    grid-template-columns: 1fr;
  }
  .rg-sysscroll__left {
    padding: var(--rg-space-10) var(--rg-space-6);
    border-right: none;
    border-bottom: 1px solid var(--rg-color-border-subtle);
  }
  .rg-sysscroll__title {
    font-size: clamp(32px, 6vw, 44px);
  }
  .rg-sysscroll__right {
    padding: var(--rg-space-6);
    /* Em mobile a coluna da imagem some pra reduzir a complexidade visual. */
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-sysscroll__feature,
  .rg-sysscroll__image-stack,
  .rg-sysscroll__page-bar {
    transition: none !important;
  }
}
</style>
