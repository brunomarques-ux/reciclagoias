<script setup lang="ts">
import { computed } from 'vue';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  variant?: Variant;
  size?: Size;
  href?: string;
  to?: string;
  icon?: string;
  iconRight?: string;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  disabled: false,
  loading: false,
  type: 'button',
});

defineEmits<{ (e: 'click', ev: MouseEvent): void }>();

const vBtnProps = computed(() => {
  const sizeMap: Record<Size, { height: number; fontSize: string; px: string }> = {
    sm: { height: 36, fontSize: 'var(--rg-font-size-sm)', px: 'var(--rg-space-4)' },
    md: { height: 44, fontSize: 'var(--rg-font-size-md)', px: 'var(--rg-space-5)' },
    lg: { height: 52, fontSize: 'var(--rg-font-size-md)', px: 'var(--rg-space-6)' },
  };

  const visual = sizeMap[props.size];
  return {
    height: visual.height,
    fontSize: visual.fontSize,
    px: visual.px,
  };
});
</script>

<template>
  <v-btn
    :class="['rg-button', `rg-button--${variant}`, `rg-button--${size}`]"
    :href="href"
    :to="to"
    :block="block"
    :disabled="disabled"
    :loading="loading"
    :type="type"
    :aria-label="ariaLabel"
    :height="vBtnProps.height"
    :style="{
      paddingInline: vBtnProps.px,
      fontSize: vBtnProps.fontSize,
    }"
    variant="flat"
    elevation="0"
    @click="(ev: MouseEvent) => $emit('click', ev)"
  >
    <template v-if="icon" #prepend>
      <v-icon :icon="icon" />
    </template>

    <slot />

    <template v-if="iconRight" #append>
      <v-icon :icon="iconRight" />
    </template>
  </v-btn>
</template>

<style scoped>
.rg-button {
  border-radius: var(--rg-radius-lg);
  font-weight: var(--rg-font-weight-semibold);
  text-transform: none;
  letter-spacing: 0;
  transition:
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-button:active:not(:disabled) {
  transform: translateY(1px);
}

/* Primary */
.rg-button--primary {
  background-color: var(--rg-color-action-primary) !important;
  color: var(--rg-color-text-on-brand) !important;
}
.rg-button--primary:hover:not(:disabled) {
  background-color: var(--rg-color-action-primary-hover) !important;
  box-shadow: var(--rg-elevation-2);
}

/* Secondary (neutro escuro) */
.rg-button--secondary {
  background-color: var(--rg-color-action-neutral) !important;
  color: var(--rg-color-text-on-brand) !important;
}
.rg-button--secondary:hover:not(:disabled) {
  background-color: var(--rg-color-action-neutral-hover) !important;
}

/* Outline */
.rg-button--outline {
  background-color: transparent !important;
  color: var(--rg-color-text-primary) !important;
  box-shadow: inset 0 0 0 1px var(--rg-color-border-base);
}
.rg-button--outline:hover:not(:disabled) {
  background-color: var(--rg-color-surface-muted) !important;
  box-shadow: inset 0 0 0 1px var(--rg-color-border-strong);
}

/* Ghost (sem borda, sem fundo) */
.rg-button--ghost {
  background-color: transparent !important;
  color: var(--rg-color-text-secondary) !important;
}
.rg-button--ghost:hover:not(:disabled) {
  background-color: var(--rg-color-surface-muted) !important;
  color: var(--rg-color-text-primary) !important;
}

.rg-button:focus-visible {
  outline: none;
  box-shadow: var(--rg-ring-focus), var(--rg-elevation-2);
}
</style>
