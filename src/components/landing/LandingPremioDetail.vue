<script setup lang="ts">
/**
 * Detalhe de um prêmio (nível 2 da seção Reconhecimento), carregado in-place
 * pelo container LandingPremio quando um card é selecionado.
 *
 * Tudo vive dentro de um CARD-MESTRE (a própria raiz `.rg-premio-detail`):
 *   - uma barra no topo com o botão "Voltar aos prêmios" em DESTAQUE (pill com
 *     borda) à esquerda + o chip do prêmio à direita;
 *   - o corpo com header, highlights e showcase.
 * Os sub-elementos (highlights, imagem) são superfícies leves (sem sombra
 * própria) pra não criar card-dentro-de-card. A imagem abre no RgLightbox.
 */
import { ref } from 'vue';
import type { Award } from '@/data/mocks/landing';
import RgLightbox from '@/components/RgLightbox.vue';

defineProps<{ award: Award }>();

const emit = defineEmits<{ (e: 'back'): void }>();

const lightboxOpen = ref(false);
const headingRef = ref<HTMLElement | null>(null);

/** Container chama após a transição in-place, pra mover o foco pro detalhe. */
function focusHeading() {
  headingRef.value?.focus({ preventScroll: true });
}

defineExpose({ focusHeading });
</script>

<template>
  <article class="rg-premio-detail">
    <!-- Barra do topo: voltar destacado à esquerda, chip do prêmio à direita -->
    <div class="rg-premio-detail__bar">
      <button type="button" class="rg-premio-detail__back" @click="emit('back')">
        <v-icon icon="mdi-arrow-left" size="18" />
        Voltar aos prêmios
      </button>
      <span class="rg-premio-detail__bar-ribbon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="13" height="13">
          <path d="M12 2 15 8l6.5.9-4.7 4.6 1.1 6.6L12 17l-5.9 3.1L7.2 13.5 2.5 8.9 9 8z" fill="#78350F" />
        </svg>
        {{ award.ribbonLabel }}
      </span>
    </div>

    <div class="rg-premio-detail__body">
      <header class="rg-premio-detail__head">
        <span class="rg-premio-detail__org">{{ award.organization }}</span>
        <!-- tabindex -1: alvo de foco programático ao entrar no detalhe -->
        <h3 ref="headingRef" tabindex="-1" class="rg-premio-detail__name">
          {{ award.name }}
        </h3>
        <p class="rg-premio-detail__when">
          <template v-if="award.eventName">{{ award.eventName }} · </template>
          {{ award.date }} · {{ award.city }}
        </p>
      </header>

      <ul v-if="award.highlights?.length" class="rg-premio-detail__highlights" role="list">
        <li
          v-for="(h, i) in award.highlights"
          :key="h.title"
          class="rg-premio-detail__highlight"
          :style="{ '--rg-h-i': i } as Record<string, string | number>"
        >
          <span class="rg-premio-detail__highlight-icon-wrap" aria-hidden="true">
            <img :src="h.icon" alt="" class="rg-premio-detail__highlight-icon" />
          </span>
          <div class="rg-premio-detail__highlight-body">
            <strong class="rg-premio-detail__highlight-title">{{ h.title }}</strong>
            <span class="rg-premio-detail__highlight-sub">{{ h.sub }}</span>
          </div>
        </li>
      </ul>

      <div class="rg-premio-detail__showcase">
        <!-- Card da imagem (logo/certificado) — clique amplia no lightbox -->
        <button
          type="button"
          class="rg-premio-detail__media"
          :aria-label="`Ampliar: ${award.imageAlt}`"
          @click="lightboxOpen = true"
        >
          <picture>
            <source v-if="award.imageWebp" :srcset="award.imageWebp" type="image/webp" />
            <img
              :src="award.imageSrc"
              :alt="award.imageAlt"
              class="rg-premio-detail__image"
              loading="lazy"
            />
          </picture>
          <span class="rg-premio-detail__zoom-hint" aria-hidden="true">
            <v-icon icon="mdi-magnify-plus-outline" size="16" />
            Ampliar
          </span>
        </button>

        <!-- Bloco descritivo: institucional + meta da premiação -->
        <div class="rg-premio-detail__info">
          <h4 class="rg-premio-detail__info-title">{{ award.detailTitle }}</h4>
          <p
            v-for="(paragraph, i) in award.detailParagraphs"
            :key="i"
            class="rg-premio-detail__info-text"
          >{{ paragraph }}</p>

          <dl class="rg-premio-detail__meta">
            <div
              v-for="m in award.meta"
              :key="m.label"
              class="rg-premio-detail__meta-item"
            >
              <dt class="rg-premio-detail__meta-label">{{ m.label }}</dt>
              <dd class="rg-premio-detail__meta-value">{{ m.value }}</dd>
            </div>
          </dl>

          <a
            v-if="award.externalLink"
            class="rg-premio-detail__cta"
            :href="award.externalLink.href"
            target="_blank"
            rel="noopener noreferrer"
          >
            <v-icon icon="mdi-open-in-new" size="16" />
            {{ award.externalLink.label }}
          </a>
        </div>
      </div>
    </div>

    <RgLightbox
      v-model="lightboxOpen"
      :image-src="award.imageSrc"
      :image-src-webp="award.imageWebp"
      :alt="award.imageAlt"
    />
  </article>
</template>

<style scoped>
/* ============ Card-mestre (unifica o detalhe inteiro) ============ */
.rg-premio-detail {
  display: flex;
  flex-direction: column;
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-primitive-brand-100);
  border-radius: var(--rg-radius-2xl);
  overflow: hidden;
  /* Sombra elevada: o card "salta" do fundo branco da seção, deixando claro
     que é uma camada de detalhe sobre a listagem. */
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 18px 48px rgba(15, 23, 42, 0.12);
}

/* ============ Barra do topo: voltar + chip ============ */
.rg-premio-detail__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-4);
  padding: var(--rg-space-4) var(--rg-space-6);
  background-color: var(--rg-primitive-neutral-50);
  border-bottom: 1px solid var(--rg-color-border-subtle);
}

/* Voltar destacado: pill com borda e fundo branco — porta de saída clara
   (antes era um ghost discreto que se perdia). */
.rg-premio-detail__back {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-4);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-pill);
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  cursor: pointer;
  transition:
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-premio-detail__back:hover {
  background-color: var(--rg-primitive-brand-50);
  border-color: var(--rg-primitive-brand-300);
  /* Desliza pra esquerda no hover — reforça o gesto de "voltar". */
  transform: translateX(-2px);
}

.rg-premio-detail__back:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.rg-premio-detail__back :deep(.v-icon) {
  color: var(--rg-primitive-brand-600);
}

.rg-premio-detail__bar-ribbon {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-1) var(--rg-space-3);
  background: linear-gradient(135deg, #FCD34D, #F59E0B);
  color: #78350F;
  border-radius: var(--rg-radius-pill);
  font-size: 11px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  white-space: nowrap;
}

/* ============ Corpo do card ============ */
.rg-premio-detail__body {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-8);
  padding: var(--rg-space-10);
}

/* ============ Header do prêmio ============ */
.rg-premio-detail__head {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}

.rg-premio-detail__org {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-700);
}

.rg-premio-detail__name {
  margin: 0;
  font-size: var(--rg-font-size-4xl);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  line-height: var(--rg-line-height-tight);
  color: var(--rg-color-text-primary);
}

.rg-premio-detail__name:focus {
  outline: none;
}

.rg-premio-detail__when {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-muted);
}

/* ============ Highlights (fileira leve, sem card-dentro-de-card) ============ */
.rg-premio-detail__highlights {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--rg-space-3);
}

.rg-premio-detail__highlight {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-3);
  align-items: center;
  padding: var(--rg-space-4) var(--rg-space-5);
  /* Superfície leve dentro do card-mestre: fundo brand-50, sem sombra. */
  background-color: var(--rg-primitive-brand-50);
  border: 1px solid var(--rg-primitive-brand-100);
  border-radius: var(--rg-radius-xl);
  animation: rg-premio-detail-highlight-in 540ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(var(--rg-h-i, 0) * 160ms);
}

@keyframes rg-premio-detail-highlight-in {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.rg-premio-detail__highlight-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-primitive-brand-200);
  flex: none;
}

.rg-premio-detail__highlight-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
  display: block;
}

.rg-premio-detail__highlight-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rg-premio-detail__highlight-title {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.rg-premio-detail__highlight-sub {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
  line-height: var(--rg-line-height-snug);
}

/* ============ Showcase: imagem + bloco descritivo ============ */
.rg-premio-detail__showcase {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: var(--rg-space-10);
  align-items: stretch;
}

.rg-premio-detail__media {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--rg-space-10);
  /* Superfície leve (sem a sombra grande de antes — o card-mestre já eleva). */
  background-color: var(--rg-primitive-neutral-50);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  cursor: zoom-in;
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-premio-detail__media:hover {
  transform: translateY(-2px);
  border-color: var(--rg-primitive-brand-200);
}

.rg-premio-detail__media:focus-visible {
  outline: 3px solid var(--rg-color-action-primary);
  outline-offset: 4px;
}

/* Dica "Ampliar" — aparece no hover/focus do card da imagem. */
.rg-premio-detail__zoom-hint {
  position: absolute;
  bottom: var(--rg-space-4);
  right: var(--rg-space-4);
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-1);
  padding: var(--rg-space-1) var(--rg-space-3);
  background-color: rgba(15, 23, 42, 0.72);
  color: white;
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  opacity: 0;
  transition: opacity var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
  pointer-events: none;
}

.rg-premio-detail__media:hover .rg-premio-detail__zoom-hint,
.rg-premio-detail__media:focus-visible .rg-premio-detail__zoom-hint {
  opacity: 1;
}

.rg-premio-detail__image {
  display: block;
  width: 100%;
  max-width: 360px;
  height: auto;
  /* Reserva proporção antes do load — a transição de altura do container
     mede o DOM; sem isso a medição sai errada com a imagem ainda baixando. */
  aspect-ratio: 4 / 3;
  object-fit: contain;
}

.rg-premio-detail__info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--rg-space-4);
}

.rg-premio-detail__info-title {
  margin: 0;
  font-size: var(--rg-font-size-2xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-premio-detail__info-text {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-premio-detail__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--rg-space-3) var(--rg-space-6);
  margin: var(--rg-space-3) 0 0;
  padding: var(--rg-space-4) var(--rg-space-5);
  background-color: var(--rg-color-surface-base);
  border-radius: var(--rg-radius-lg);
  border: 1px solid var(--rg-primitive-brand-100);
  border-left: 3px solid var(--rg-primitive-brand-500);
}

.rg-premio-detail__meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rg-premio-detail__meta-label {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-700);
}

.rg-premio-detail__meta-value {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  line-height: var(--rg-line-height-snug);
}

.rg-premio-detail__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  align-self: flex-start;
  margin-top: var(--rg-space-2);
  padding: var(--rg-space-3) var(--rg-space-5);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  text-decoration: none;
  transition:
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-premio-detail__cta:hover {
  background-color: var(--rg-primitive-brand-50);
  border-color: var(--rg-primitive-brand-300);
}

.rg-premio-detail__cta :deep(.v-icon) {
  color: var(--rg-primitive-brand-600);
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-premio-detail__body {
    padding: var(--rg-space-8);
  }
  .rg-premio-detail__name {
    font-size: clamp(28px, 5.5vw, 36px);
  }
  .rg-premio-detail__showcase {
    grid-template-columns: 1fr;
  }
  .rg-premio-detail__media {
    padding: var(--rg-space-8);
  }
  .rg-premio-detail__image {
    max-width: 280px;
  }
}

@media (max-width: 640px) {
  .rg-premio-detail__bar {
    padding: var(--rg-space-3) var(--rg-space-4);
  }
  /* Chip some no mobile estreito pra a barra não apertar o voltar. */
  .rg-premio-detail__bar-ribbon {
    display: none;
  }
  .rg-premio-detail__body {
    padding: var(--rg-space-6) var(--rg-space-5);
  }
  .rg-premio-detail__meta {
    grid-template-columns: 1fr;
  }
  .rg-premio-detail__cta {
    display: flex;
    align-self: stretch;
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-premio-detail__highlight {
    animation: none !important;
  }
  .rg-premio-detail__back,
  .rg-premio-detail__media,
  .rg-premio-detail__zoom-hint {
    transition: none !important;
  }
}
</style>
