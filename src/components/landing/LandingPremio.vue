<script setup lang="ts">
import { ref } from 'vue';
import RgLightbox from '@/components/RgLightbox.vue';

const lightboxOpen = ref(false);

const highlights = [
  {
    icon: 'mdi-trophy-outline',
    title: 'Melhor Projeto do ano',
    sub: 'Reconhecimento PMI Goiás 2025',
  },
  {
    icon: 'mdi-account-group-outline',
    title: 'Time multidisciplinar',
    sub: 'GETI/SIC + CLR/SIC',
  },
  {
    icon: 'mdi-calendar-month-outline',
    title: '18º Seminário',
    sub: 'Em Gestão, Projetos e Liderança',
  },
];
</script>

<template>
  <section id="premio" class="rg-premio" aria-labelledby="rg-premio-title">
    <div class="rg-premio__inner">
      <!-- Header: copy à esquerda + highlights à direita -->
      <header class="rg-premio__header">
        <div class="rg-premio__copy">
          <span class="rg-premio__eyebrow">RECONHECIMENTO</span>
          <h2 id="rg-premio-title" class="rg-premio__title">
            <span class="rg-premio__title-line">
              Melhor Projeto
              <span class="rg-premio__trophy" aria-hidden="true">
                <v-icon icon="mdi-trophy" size="40" />
              </span>
              de 2025
            </span>
            <span class="rg-premio__title-line rg-premio__title-brand">
              PMI Goiás 2025
            </span>
          </h2>
          <p class="rg-premio__desc">
            O Projeto Recicla Goiás foi reconhecido como Melhor Projeto pelo
            Project Management Institute Goiás durante o 18º Seminário Em Gestão,
            Projetos e Liderança.
          </p>
        </div>

        <ul class="rg-premio__highlights" role="list">
          <li v-for="h in highlights" :key="h.title" class="rg-premio__highlight">
            <span class="rg-premio__highlight-icon" aria-hidden="true">
              <v-icon :icon="h.icon" size="22" />
            </span>
            <div class="rg-premio__highlight-body">
              <strong class="rg-premio__highlight-title">{{ h.title }}</strong>
              <span class="rg-premio__highlight-sub">{{ h.sub }}</span>
            </div>
          </li>
        </ul>
      </header>

      <!-- Certificado clicável -->
      <button
        type="button"
        class="rg-premio__cert"
        :aria-label="`Abrir certificado em tamanho ampliado · Melhor Projeto PMI Goiás 2025`"
        @click="lightboxOpen = true"
      >
        <picture class="rg-premio__cert-media">
          <source srcset="/premio/certificado@2x.webp" type="image/webp" media="(min-width: 1200px)" />
          <source srcset="/premio/certificado.webp" type="image/webp" />
          <img
            src="/premio/certificado.jpg"
            alt="Certificado Melhor Projeto 2025 do PMI Goiás concedido ao Projeto Recicla Goiás"
            loading="lazy"
          />
        </picture>

        <span class="rg-premio__ribbon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M12 2 15 8l6.5.9-4.7 4.6 1.1 6.6L12 17l-5.9 3.1L7.2 13.5 2.5 8.9 9 8z" fill="#78350F" />
          </svg>
          MELHOR PROJETO 2025
        </span>

        <span class="rg-premio__cert-hint" aria-hidden="true">
          <v-icon icon="mdi-magnify-plus-outline" size="16" />
          Clique para ampliar
        </span>
      </button>
    </div>

    <RgLightbox
      v-model="lightboxOpen"
      image-src="/premio/certificado.jpg"
      image-src-webp="/premio/certificado@2x.webp"
      alt="Certificado Melhor Projeto 2025 · PMI Goiás · Projeto Recicla Goiás"
      :zoomable="true"
    />
  </section>
</template>

<style scoped>
.rg-premio {
  position: relative;
  padding: var(--rg-space-20) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
}

.rg-premio__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

/* ============ Header ============ */
.rg-premio__header {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(360px, 1fr);
  align-items: start;
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
  /* Tamanho um pouco menor para caber a primeira linha inteira em desktop. */
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  color: var(--rg-primitive-brand-700);
  flex: none;
}
.rg-premio__trophy :deep(.v-icon) {
  font-size: 28px !important;
}

.rg-premio__desc {
  margin: var(--rg-space-2) 0 0;
  max-width: 60ch;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* ============ Highlights ============ */
.rg-premio__highlights {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-premio__highlight {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-3);
  align-items: center;
  padding: var(--rg-space-4) var(--rg-space-5);
  background-color: var(--rg-color-surface-base);
  border-radius: var(--rg-radius-xl);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 6px 18px rgba(15, 23, 42, 0.06);
}

.rg-premio__highlight-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-primitive-brand-50);
  color: var(--rg-primitive-brand-700);
}

.rg-premio__highlight-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rg-premio__highlight-title {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.rg-premio__highlight-sub {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
  line-height: var(--rg-line-height-snug);
}

/* ============ Certificado ============ */
.rg-premio__cert {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: zoom-in;
  border-radius: var(--rg-radius-2xl);
  overflow: visible;
  transition: transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-premio__cert:hover {
  transform: translateY(-2px);
}

.rg-premio__cert:hover .rg-premio__cert-hint {
  opacity: 1;
  transform: translateY(0);
}

.rg-premio__cert:focus-visible {
  outline: 3px solid var(--rg-color-action-primary);
  outline-offset: 4px;
}

.rg-premio__cert-media {
  display: block;
  width: 100%;
  border-radius: var(--rg-radius-2xl);
  overflow: hidden;
  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.08),
    0 24px 60px rgba(15, 23, 42, 0.12);
}

.rg-premio__cert-media img {
  display: block;
  width: 100%;
  height: auto;
}

.rg-premio__ribbon {
  position: absolute;
  top: var(--rg-space-5);
  right: var(--rg-space-5);
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-4);
  background: linear-gradient(135deg, #FCD34D, #F59E0B);
  color: #78350F;
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.32);
  pointer-events: none;
}

.rg-premio__cert-hint {
  position: absolute;
  left: 50%;
  bottom: var(--rg-space-4);
  transform: translateX(-50%) translateY(4px);
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-1);
  padding: var(--rg-space-2) var(--rg-space-3);
  background-color: rgba(15, 23, 42, 0.78);
  color: white;
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-base);
  opacity: 0;
  transition:
    opacity var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
  pointer-events: none;
  backdrop-filter: blur(6px);
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-premio__header {
    grid-template-columns: 1fr;
    gap: var(--rg-space-8);
  }
  .rg-premio__title { font-size: clamp(32px, 6vw, 44px); }
  .rg-premio__title-line {
    flex-wrap: wrap;
    white-space: normal;
  }
  .rg-premio__trophy { width: 40px; height: 40px; }
  .rg-premio__trophy :deep(.v-icon) { font-size: 24px !important; }
}

@media (max-width: 640px) {
  .rg-premio { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-premio__ribbon {
    top: var(--rg-space-3);
    right: var(--rg-space-3);
    padding: 4px var(--rg-space-2);
    font-size: 10px;
  }
}
</style>
