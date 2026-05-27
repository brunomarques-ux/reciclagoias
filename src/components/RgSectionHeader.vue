<script setup lang="ts">
interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  tone?: 'default' | 'inverse';
}

withDefaults(defineProps<Props>(), {
  align: 'left',
  tone: 'default',
});
</script>

<template>
  <header
    :class="[
      'rg-section-header',
      `rg-section-header--${align}`,
      `rg-section-header--${tone}`,
    ]"
  >
    <span v-if="eyebrow" class="rg-section-header__eyebrow">{{ eyebrow }}</span>
    <h2 class="rg-section-header__title">{{ title }}</h2>
    <p v-if="description" class="rg-section-header__description">{{ description }}</p>
  </header>
</template>

<style scoped>
.rg-section-header {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  max-width: 720px;
}

.rg-section-header--center {
  align-items: center;
  text-align: center;
  margin-inline: auto;
}

.rg-section-header__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-section-header__title {
  margin: 0;
  font-size: var(--rg-font-size-4xl);
  line-height: var(--rg-line-height-tight);
  letter-spacing: var(--rg-letter-spacing-tight);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.rg-section-header__description {
  margin: 0;
  font-size: var(--rg-font-size-lg);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-section-header--inverse .rg-section-header__eyebrow {
  color: var(--rg-primitive-brand-200);
}
.rg-section-header--inverse .rg-section-header__title {
  color: var(--rg-color-text-on-inverse);
}
.rg-section-header--inverse .rg-section-header__description {
  color: rgba(255, 255, 255, 0.78);
}

@media (max-width: 768px) {
  .rg-section-header__title {
    font-size: var(--rg-font-size-3xl);
  }
  .rg-section-header__description {
    font-size: var(--rg-font-size-md);
  }
}
</style>
