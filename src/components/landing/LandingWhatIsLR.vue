<script setup lang="ts">
import { whatIsCards } from '@/data/mocks/landing';
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
        <li v-for="card in whatIsCards" :key="card.title" class="rg-whatis__card">
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
  font-size: clamp(40px, 5vw, 64px);
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

.rg-whatis__icon-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.15em;
  height: 1.15em;
  padding: 0.1em;
  border-radius: 9999px;
  background-color: var(--rg-primitive-brand-50);
  overflow: hidden;
  vertical-align: middle;
}

.rg-whatis__icon-chip img {
  width: 100%;
  height: 100%;
  object-fit: contain;
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
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-3);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  align-self: flex-start;
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
}

.rg-whatis__card-media {
  display: block;
  /* Aspect-ratio 4/3 (foto menos quadrada, mais paisagem) — imagem fica menor verticalmente. */
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--rg-radius-xl);
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
  padding-inline: var(--rg-space-1);
}

.rg-whatis__card-title {
  margin: 0;
  font-size: var(--rg-font-size-lg);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
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
