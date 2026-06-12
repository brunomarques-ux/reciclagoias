<script setup lang="ts">
/**
 * Card de prêmio na listagem (nível 1 da seção Reconhecimento).
 *
 * O card inteiro é clicável (cursor pointer + @click), mas o elemento
 * focável é o botão "Ver detalhes" — é nele que o container devolve o foco
 * quando o usuário volta do detalhe (classe .rg-premio-card__btn).
 */
import type { Award } from '@/data/mocks/landing';

defineProps<{ award: Award }>();

const emit = defineEmits<{ (e: 'select'): void }>();
</script>

<template>
  <article class="rg-premio-card" @click="emit('select')">
    <div class="rg-premio-card__media">
      <img
        :src="award.imageSrc"
        :alt="award.imageAlt"
        class="rg-premio-card__image"
        loading="lazy"
      />
      <span class="rg-premio-card__ribbon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="12" height="12">
          <path d="M12 2 15 8l6.5.9-4.7 4.6 1.1 6.6L12 17l-5.9 3.1L7.2 13.5 2.5 8.9 9 8z" fill="#78350F" />
        </svg>
        {{ award.ribbonLabel }}
      </span>
    </div>

    <div class="rg-premio-card__body">
      <span class="rg-premio-card__org">{{ award.organization }}</span>
      <h3 class="rg-premio-card__name">{{ award.name }}</h3>
      <p class="rg-premio-card__summary">{{ award.summary }}</p>

      <div class="rg-premio-card__footer">
        <span class="rg-premio-card__when">{{ award.date }} · {{ award.city }}</span>
        <button
          type="button"
          class="rg-premio-card__btn"
          @click.stop="emit('select')"
        >
          Ver detalhes
          <v-icon icon="mdi-arrow-right" size="16" />
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.rg-premio-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-2xl);
  overflow: hidden;
  cursor: pointer;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 6px 18px rgba(15, 23, 42, 0.06);
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-premio-card:hover {
  transform: translateY(-3px);
  border-color: var(--rg-primitive-brand-200);
  box-shadow:
    0 2px 4px rgba(15, 23, 42, 0.06),
    0 16px 36px rgba(15, 23, 42, 0.1);
}

/* Área da imagem: proporção fixa pra todos os prêmios (logo ou certificado)
   com object-fit contain sobre fundo claro — também garante medição de
   altura correta na transição in-place do container. */
.rg-premio-card__media {
  position: relative;
  aspect-ratio: 16 / 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--rg-space-6);
  background-color: var(--rg-primitive-neutral-50);
  border-bottom: 1px solid var(--rg-color-border-subtle);
}

.rg-premio-card__image {
  max-width: 70%;
  max-height: 100%;
  object-fit: contain;
}

/* Fita dourada — versão compacta da fita do showcase original. */
.rg-premio-card__ribbon {
  position: absolute;
  top: var(--rg-space-3);
  right: var(--rg-space-3);
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-1);
  padding: var(--rg-space-1) var(--rg-space-3);
  background: linear-gradient(135deg, #FCD34D, #F59E0B);
  color: #78350F;
  border-radius: var(--rg-radius-pill);
  font-size: 10px;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.28);
  pointer-events: none;
}

.rg-premio-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  flex: 1;
  padding: var(--rg-space-5) var(--rg-space-6) var(--rg-space-6);
}

.rg-premio-card__org {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-700);
}

.rg-premio-card__name {
  margin: 0;
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.rg-premio-card__summary {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-premio-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-3);
  margin-top: auto;
  padding-top: var(--rg-space-4);
}

.rg-premio-card__when {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
  font-weight: var(--rg-font-weight-medium);
}

.rg-premio-card__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-4);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  cursor: pointer;
  white-space: nowrap;
  transition:
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-premio-card__btn:hover {
  background-color: var(--rg-primitive-brand-50);
  border-color: var(--rg-primitive-brand-300);
}

.rg-premio-card__btn:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.rg-premio-card__btn :deep(.v-icon) {
  color: var(--rg-primitive-brand-600);
}

@media (max-width: 640px) {
  .rg-premio-card__footer {
    flex-direction: column;
    align-items: stretch;
  }
  .rg-premio-card__when {
    text-align: center;
  }
  .rg-premio-card__btn {
    justify-content: center;
  }
}
</style>
