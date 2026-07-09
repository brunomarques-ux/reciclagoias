<script setup lang="ts">
/**
 * Captcha mock (visual) reutilizado na busca e na validação de documento.
 *
 * É 100% visual: clicar em "Não sou um robô" mostra um spinner curto e
 * depois marca o check verde. No produto real, trocar por um provider
 * (reCAPTCHA / hCaptcha / Cloudflare Turnstile) com verificação server-side
 * (ver docs/HANDOFF-CONSULTA-REGULARIDADE.md §4.5).
 *
 * v-model = "verificado" (boolean). O pai zera pra false pra resetar (ex.:
 * nova consulta / validar outro documento) e o captcha volta ao estado idle.
 */
import { ref, watch } from 'vue';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

type CaptchaState = 'idle' | 'checking' | 'done';
const state = ref<CaptchaState>('idle');

// Reset externo: quando o pai zera o v-model, o captcha volta ao início.
watch(
  () => props.modelValue,
  (v) => {
    if (!v) state.value = 'idle';
  },
);

function toggle() {
  if (state.value !== 'idle') return;
  state.value = 'checking';
  window.setTimeout(() => {
    state.value = 'done';
    emit('update:modelValue', true);
  }, 900);
}
</script>

<template>
  <button
    type="button"
    :class="['cx-captcha', { 'is-done': state === 'done' }]"
    :aria-pressed="state === 'done'"
    aria-label="Não sou um robô"
    @click="toggle"
  >
    <span class="cx-captcha__left">
      <span :class="['cx-captcha__box', `is-${state}`]" aria-hidden="true">
        <v-progress-circular
          v-if="state === 'checking'"
          indeterminate
          size="18"
          width="2"
          color="var(--rg-primitive-brand-600)"
        />
        <v-icon v-else-if="state === 'done'" icon="mdi-check-bold" size="18" />
      </span>
      Não sou um robô
    </span>
    <span class="cx-captcha__right" aria-hidden="true">
      <v-icon icon="mdi-refresh" size="24" />
      <small>reCAPTCHA</small>
      <small class="cx-captcha__terms">Privacidade · Termos</small>
    </span>
  </button>
</template>

<style scoped>
.cx-captcha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-4);
  width: 100%;
  min-height: 74px;
  padding-inline: var(--rg-space-5);
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-xl);
  background-color: var(--rg-color-surface-base);
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-primary);
  cursor: pointer;
  transition: border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-captcha.is-done {
  border-color: var(--rg-primitive-brand-100);
  cursor: default;
}

.cx-captcha:focus-visible {
  outline: none;
  box-shadow: var(--rg-ring-focus);
}

.cx-captcha__left {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-3);
}

.cx-captcha__box {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 2px solid var(--rg-color-border-strong);
  border-radius: var(--rg-radius-sm);
  color: var(--rg-primitive-brand-600);
  transition: border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-captcha__box.is-checking {
  border-color: transparent;
}

.cx-captcha__box.is-done {
  border-color: var(--rg-primitive-brand-600);
  animation: cx-captcha-pop 0.3s var(--rg-motion-ease-emphasized);
}

@keyframes cx-captcha-pop {
  0% { transform: scale(0.7); }
  60% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

.cx-captcha__right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  color: var(--rg-primitive-brand-500);
}

.cx-captcha__right small {
  font-size: 9px;
  color: var(--rg-color-text-tertiary);
}

.cx-captcha__terms {
  font-size: 8px !important;
}

@media (prefers-reduced-motion: reduce) {
  .cx-captcha__box.is-done {
    animation: none !important;
  }
}
</style>
