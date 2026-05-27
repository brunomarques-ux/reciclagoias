<script setup lang="ts">
import { computed } from 'vue';
import type { MaterialKey } from '@/data/mocks/landing';

type Tone = 'brand' | MaterialKey | 'neutral';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  value: number;
  unit?: string;
  icon?: string;
  tone?: Tone;
  size?: Size;
  delta?: { value: number; label: string };
  elevated?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'neutral',
  size: 'md',
  elevated: false,
});

const formattedValue = computed(() =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(props.value),
);

const deltaDirection = computed(() => {
  if (!props.delta) return null;
  return props.delta.value >= 0 ? 'up' : 'down';
});

const formattedDelta = computed(() => {
  if (!props.delta) return null;
  const v = props.delta.value;
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(1).replace('.', ',')}%`;
});
</script>

<template>
  <article
    :class="[
      'rg-stat-card',
      `rg-stat-card--${tone}`,
      `rg-stat-card--${size}`,
      { 'rg-stat-card--elevated': elevated },
    ]"
  >
    <div class="rg-stat-card__top">
      <span class="rg-stat-card__label">{{ label }}</span>
      <span v-if="icon" class="rg-stat-card__icon" aria-hidden="true">
        <v-icon :icon="icon" size="20" />
      </span>
    </div>

    <div class="rg-stat-card__value-row">
      <span class="rg-stat-card__value">{{ formattedValue }}</span>
      <span v-if="unit" class="rg-stat-card__unit">{{ unit }}</span>
    </div>

    <div v-if="delta && deltaDirection" class="rg-stat-card__delta" :data-direction="deltaDirection">
      <v-icon
        :icon="deltaDirection === 'up' ? 'mdi-arrow-top-right' : 'mdi-arrow-bottom-right'"
        size="14"
      />
      <span>{{ formattedDelta }}</span>
      <span class="rg-stat-card__delta-label">{{ delta.label }}</span>
    </div>
  </article>
</template>

<style scoped>
.rg-stat-card {
  --rg-stat-card-accent: var(--rg-color-text-secondary);
  --rg-stat-card-accent-soft: var(--rg-color-surface-muted);

  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  padding: var(--rg-space-5);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  transition:
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-stat-card--elevated {
  box-shadow: var(--rg-elevation-2);
}

.rg-stat-card:hover {
  border-color: var(--rg-color-border-base);
  box-shadow: var(--rg-elevation-2);
}

.rg-stat-card--sm { padding: var(--rg-space-4); gap: var(--rg-space-2); }
.rg-stat-card--lg { padding: var(--rg-space-6); gap: var(--rg-space-4); }

/* Tons */
.rg-stat-card--brand {
  --rg-stat-card-accent: var(--rg-color-action-primary);
  --rg-stat-card-accent-soft: var(--rg-color-surface-brand);
  background-color: var(--rg-primitive-brand-600);
  border-color: var(--rg-primitive-brand-700);
  color: var(--rg-color-text-on-brand);
}
.rg-stat-card--brand .rg-stat-card__label,
.rg-stat-card--brand .rg-stat-card__value,
.rg-stat-card--brand .rg-stat-card__unit {
  color: var(--rg-color-text-on-brand);
}
.rg-stat-card--brand .rg-stat-card__icon {
  background-color: rgba(255, 255, 255, 0.18);
  color: var(--rg-color-text-on-brand);
}

.rg-stat-card--paper    { --rg-stat-card-accent: var(--rg-data-material-paper);    --rg-stat-card-accent-soft: var(--rg-data-material-paper-soft); }
.rg-stat-card--plastic  { --rg-stat-card-accent: var(--rg-data-material-plastic);  --rg-stat-card-accent-soft: var(--rg-data-material-plastic-soft); }
.rg-stat-card--metal    { --rg-stat-card-accent: var(--rg-data-material-metal);    --rg-stat-card-accent-soft: var(--rg-data-material-metal-soft); }
.rg-stat-card--glass    { --rg-stat-card-accent: var(--rg-data-material-glass);    --rg-stat-card-accent-soft: var(--rg-data-material-glass-soft); }

.rg-stat-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--rg-space-3);
}

.rg-stat-card__label {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-secondary);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
}

.rg-stat-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-stat-card-accent-soft);
  color: var(--rg-stat-card-accent);
}

.rg-stat-card__value-row {
  display: flex;
  align-items: baseline;
  gap: var(--rg-space-2);
}

.rg-stat-card__value {
  font-size: var(--rg-font-size-4xl);
  line-height: var(--rg-line-height-tight);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.rg-stat-card--sm .rg-stat-card__value { font-size: var(--rg-font-size-2xl); }
.rg-stat-card--lg .rg-stat-card__value { font-size: var(--rg-font-size-5xl); }

.rg-stat-card__unit {
  font-size: var(--rg-font-size-lg);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

.rg-stat-card__delta {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-1);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-feedback-success);
}
.rg-stat-card__delta[data-direction='down'] {
  color: var(--rg-color-feedback-danger);
}
.rg-stat-card__delta-label {
  margin-left: var(--rg-space-1);
  font-weight: var(--rg-font-weight-regular);
  color: var(--rg-color-text-muted);
}
.rg-stat-card--brand .rg-stat-card__delta,
.rg-stat-card--brand .rg-stat-card__delta-label {
  color: rgba(255, 255, 255, 0.82);
}
</style>
