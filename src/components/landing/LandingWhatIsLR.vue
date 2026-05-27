<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { whatIsCards } from '@/data/mocks/landing';

/**
 * Fade-in stagger dos cards ao entrarem no viewport.
 * IntersectionObserver puro + CSS transition (sem framework pra esse case).
 * Cada card recebe `--rg-stagger-delay` proporcional ao índice.
 */
const cardRefs = ref<(HTMLElement | null)[]>([]);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  // Respeita `prefers-reduced-motion`: torna o efeito instantâneo
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    cardRefs.value.forEach((el) => el?.classList.add('is-visible'));
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -10% 0px' },
  );

  cardRefs.value.forEach((el) => el && observer?.observe(el));
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <section id="sobre" class="rg-whatis" aria-labelledby="rg-whatis-title">
    <div class="rg-whatis__inner">
      <!-- Header: título à esquerda, box do decreto à direita -->
      <header class="rg-whatis__header">
        <div class="rg-whatis__copy">
          <span class="rg-whatis__eyebrow">O QUE É</span>
          <h2 id="rg-whatis-title" class="rg-whatis__title">
            <span class="rg-whatis__title-line">Logística Reversa</span>
            <span class="rg-whatis__title-line rg-whatis__title-second">
              <span class="rg-whatis__connector">do</span>
              <span class="rg-whatis__icon-chip" aria-hidden="true">
                <picture>
                  <source srcset="/whatis/pin.png" type="image/png" />
                  <img src="/whatis/pin.png" alt="" />
                </picture>
              </span>
              <span class="rg-whatis__connector">ao</span>
              <span class="rg-whatis__icon-chip" aria-hidden="true">
                <picture>
                  <source srcset="/whatis/factory.png" type="image/png" />
                  <img src="/whatis/factory.png" alt="" />
                </picture>
              </span>
            </span>
          </h2>
        </div>

        <a class="rg-whatis__decree" href="#decreto" target="_blank" rel="noopener noreferrer">
          <span class="rg-whatis__decree-label">CLIQUE PARA ACESSAR O TEXTO DO DECRETO</span>
          <span class="rg-whatis__decree-cta">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M14 3h7v7M21 3 10 14m-4-9H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"
                fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Acessar Decreto 10.255/2023
          </span>
        </a>
      </header>

      <!-- 3 cards horizontais com foto + descrição -->
      <ul class="rg-whatis__cards" role="list">
        <li
          v-for="(card, idx) in whatIsCards"
          :key="card.title"
          :ref="(el) => { cardRefs[idx] = el as HTMLElement | null }"
          :style="{ '--rg-stagger-delay': `${idx * 120}ms` }"
          class="rg-whatis__card"
        >
          <picture class="rg-whatis__card-media">
            <source :srcset="card.imageWebp" type="image/webp" />
            <img :src="card.imageJpg" :alt="card.alt" loading="lazy" />
          </picture>
          <div class="rg-whatis__card-body">
            <h3 class="rg-whatis__card-title">{{ card.title }}</h3>
            <p class="rg-whatis__card-desc">{{ card.description }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.rg-whatis {
  position: relative;
  padding: var(--rg-space-20) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
}

.rg-whatis__inner {
  max-width: var(--rg-container-page); /* 1200px fixo, centralizado */
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

/* ===== Header ===== */
.rg-whatis__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  /* Alinhamento inferior: o eyebrow + decreto compartilham a mesma baseline visual. */
  align-items: end;
  gap: var(--rg-space-12);
}

.rg-whatis__copy {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
}

.rg-whatis__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-whatis__title {
  margin: 0;
  /* Tamanho exato do Figma: 56px bold, sem clamp em desktop. */
  font-size: 56px;
  line-height: 1.05;
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}

.rg-whatis__title-line {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--rg-space-3);
}

.rg-whatis__connector {
  font-weight: var(--rg-font-weight-bold);
}

/* Wrapper só pra dimensionar o ícone alinhado ao texto — sem background nem
   padding, porque o PNG já vem do Figma com seu "frame" completo (pin verde
   com folha, fábrica com setas de reciclagem). Adicionar fundo aqui duplicaria
   o efeito visual. */
.rg-whatis__icon-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.05em;
  height: 1.05em;
  vertical-align: middle;
}

.rg-whatis__icon-chip img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* ===== Decreto box ===== */
.rg-whatis__decree {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-4) var(--rg-space-5);
  /* Fundo cinza claro #F6F6F6 (cobre o card todo, como no Figma). */
  background-color: #F6F6F6;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  text-decoration: none;
  max-width: 320px;
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-whatis__decree:hover {
  transform: translateY(-2px);
  background-color: #EFEFEF;
  border-color: var(--rg-color-border-base);
}

.rg-whatis__decree-label {
  font-size: 11px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: #647488; /* cinza-azulado conforme inspeção do Figma */
  line-height: var(--rg-line-height-snug);
}

.rg-whatis__decree-cta {
  /* Full container: ocupa toda a largura do card de decreto. */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-2);
  width: 100%;
  padding: var(--rg-space-3) var(--rg-space-4);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.rg-whatis__decree:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

/* ===== Cards ===== */
.rg-whatis__cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* Gap maior entre cards pra dar mais respiro. */
  gap: var(--rg-space-10);
}

.rg-whatis__card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  padding: var(--rg-space-4);
  background-color: var(--rg-color-surface-base);
  /* Sem stroke: só sombra. Profundidade vem da combinação de duas camadas. */
  border-radius: var(--rg-radius-2xl);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 32px rgba(15, 23, 42, 0.08);
  /* Estado inicial do fade-stagger: invisível e levemente abaixado. */
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.7s cubic-bezier(0.2, 0, 0, 1) var(--rg-stagger-delay, 0ms),
    transform 0.7s cubic-bezier(0.2, 0, 0, 1) var(--rg-stagger-delay, 0ms),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-whatis__card.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.rg-whatis__card:hover {
  box-shadow:
    0 2px 4px rgba(15, 23, 42, 0.06),
    0 20px 48px rgba(15, 23, 42, 0.12);
}

/* Hover translateY só aplica quando já visível pra não conflitar com o fade. */
.rg-whatis__card.is-visible:hover {
  transform: translateY(-4px);
}

.rg-whatis__card-media {
  display: block;
  /* Aspect-ratio 4/3 (foto menos quadrada, mais paisagem) — imagem fica menor verticalmente. */
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-muted);
}

.rg-whatis__card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--rg-motion-duration-slow) var(--rg-motion-ease-standard);
}

.rg-whatis__card:hover .rg-whatis__card-media img {
  transform: scale(1.04);
}

.rg-whatis__card-body {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  padding-inline: var(--rg-space-2);
  padding-bottom: var(--rg-space-2);
}

.rg-whatis__card-title {
  margin: 0;
  font-size: var(--rg-font-size-lg);
  font-weight: var(--rg-font-weight-bold);
  /* Verde escuro brand-900 para os títulos dos cards (não preto). */
  color: var(--rg-primitive-brand-900);
  letter-spacing: var(--rg-letter-spacing-tight);
  line-height: var(--rg-line-height-snug);
}

.rg-whatis__card-desc {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* ===== Responsivo ===== */
@media (max-width: 960px) {
  .rg-whatis__header {
    grid-template-columns: 1fr;
  }
  .rg-whatis__decree {
    max-width: none;
  }
  .rg-whatis__cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .rg-whatis {
    padding: var(--rg-space-14) var(--rg-space-4);
  }
  .rg-whatis__cards {
    grid-template-columns: 1fr;
  }
}
</style>
