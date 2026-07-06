<script setup lang="ts">
/** Toast visual do módulo de consulta — lê o estado global de useToast. */
import { useToast } from '@/composables/useToast';

const { state, dismiss } = useToast();

const icon = {
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle-outline',
  info: 'mdi-information-outline',
} as const;
</script>

<template>
  <Teleport to="body">
    <Transition name="rg-toast">
      <div
        v-if="state.show"
        :class="['rg-toast', `is-${state.tone}`]"
        role="status"
        aria-live="polite"
      >
        <v-icon :icon="icon[state.tone]" size="22" aria-hidden="true" />
        <div class="rg-toast__body">
          <strong>{{ state.message }}</strong>
          <span v-if="state.detail">{{ state.detail }}</span>
        </div>
        <button type="button" class="rg-toast__close" aria-label="Fechar" @click="dismiss">
          <v-icon icon="mdi-close" size="18" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rg-toast {
  position: fixed;
  left: 50%;
  bottom: var(--rg-space-8);
  transform: translateX(-50%);
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  max-width: min(460px, calc(100vw - 32px));
  padding: var(--rg-space-4) var(--rg-space-5);
  border-radius: var(--rg-radius-xl);
  background-color: var(--rg-primitive-neutral-900);
  color: var(--rg-primitive-neutral-0);
  box-shadow: var(--rg-elevation-4);
}

.rg-toast > .v-icon {
  flex: none;
}

.rg-toast.is-success > .v-icon {
  color: var(--rg-primitive-brand-300);
}

.rg-toast.is-error > .v-icon {
  color: var(--rg-primitive-amber-500);
}

.rg-toast.is-info > .v-icon {
  color: var(--rg-primitive-neutral-0);
}

.rg-toast__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rg-toast__body strong {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
}

.rg-toast__body span {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-primitive-neutral-300);
}

.rg-toast__close {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  margin-left: var(--rg-space-2);
  border: none;
  border-radius: var(--rg-radius-pill);
  background: transparent;
  color: var(--rg-primitive-neutral-400);
  cursor: pointer;
}

.rg-toast__close:hover {
  background-color: rgba(255, 255, 255, 0.12);
  color: var(--rg-primitive-neutral-0);
}

/* Entrada/saída: sobe de baixo com fade */
.rg-toast-enter-active,
.rg-toast-leave-active {
  transition:
    opacity var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-emphasized);
}

.rg-toast-enter-from,
.rg-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}

@media (prefers-reduced-motion: reduce) {
  .rg-toast-enter-active,
  .rg-toast-leave-active {
    transition: opacity var(--rg-motion-duration-fast) linear;
  }
  .rg-toast-enter-from,
  .rg-toast-leave-to {
    transform: translate(-50%, 0);
  }
}
</style>
