<script setup lang="ts">
interface Props {
  title: string;
  description: string;
  icon?: string;
  index?: string;
  variant?: 'plain' | 'numbered';
}

withDefaults(defineProps<Props>(), {
  variant: 'plain',
});
</script>

<template>
  <article :class="['rg-feature-card', `rg-feature-card--${variant}`]">
    <div class="rg-feature-card__top">
      <span v-if="variant === 'numbered' && index" class="rg-feature-card__index">{{ index }}</span>
      <span v-if="icon" class="rg-feature-card__icon" aria-hidden="true">
        <v-icon :icon="icon" size="22" />
      </span>
    </div>
    <h3 class="rg-feature-card__title">{{ title }}</h3>
    <p class="rg-feature-card__description">{{ description }}</p>
  </article>
</template>

<style scoped>
.rg-feature-card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-6);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  height: 100%;
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-feature-card:hover {
  transform: translateY(-2px);
  border-color: var(--rg-color-border-base);
  box-shadow: var(--rg-elevation-2);
}

.rg-feature-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-3);
  min-height: 44px;
}

.rg-feature-card__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding-inline: var(--rg-space-2);
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
}

.rg-feature-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
}

.rg-feature-card__title {
  margin: 0;
  font-size: var(--rg-font-size-xl);
  line-height: var(--rg-line-height-snug);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-feature-card__description {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}
</style>
