<script setup lang="ts">
/**
 * Estado inicial da consulta — CNPJ + captcha mock + CTA.
 *
 * O captcha é 100% visual (clique → "verificando" → check verde); o real
 * precisa de provider/backend. O submit só libera com CNPJ completo
 * (14 dígitos) e captcha marcado; caso contrário o card balança (shake)
 * e mostra a dica do que falta.
 */
import { computed, ref } from 'vue';
import RgButton from '@/components/RgButton.vue';
import { maskCnpj, onlyDigits } from '@/data/mocks/consulta';

const emit = defineEmits<{ (e: 'consultar', cnpj: string): void }>();

const cnpj = ref('');
const captchaState = ref<'idle' | 'checking' | 'done'>('idle');
const shake = ref(false);
const hint = ref('');

const cnpjCompleto = computed(() => onlyDigits(cnpj.value).length === 14);

function onInput(ev: Event) {
  const input = ev.target as HTMLInputElement;
  cnpj.value = maskCnpj(input.value);
  input.value = cnpj.value;
  if (cnpjCompleto.value) hint.value = '';
}

function toggleCaptcha() {
  if (captchaState.value !== 'idle') return;
  captchaState.value = 'checking';
  window.setTimeout(() => {
    captchaState.value = 'done';
    hint.value = '';
  }, 900);
}

function submit() {
  if (!cnpjCompleto.value) {
    hint.value = 'Digite o CNPJ completo (14 dígitos).';
    bounce();
    return;
  }
  if (captchaState.value !== 'done') {
    hint.value = 'Confirme que você não é um robô.';
    bounce();
    return;
  }
  emit('consultar', cnpj.value);
}

function bounce() {
  shake.value = false;
  requestAnimationFrame(() => {
    shake.value = true;
    window.setTimeout(() => (shake.value = false), 500);
  });
}
</script>

<template>
  <div class="cx-busca">
    <span class="cx-busca__eyebrow">CONSULTA PÚBLICA</span>

    <h1 class="cx-busca__title">
      Consulte a <span class="cx-busca__title-accent">regularidade</span><br />
      da sua empresa no Recicla Goiás
    </h1>

    <p class="cx-busca__subtitle">
      Verifique a situação de qualquer empresa perante o Recicla Goiás, o sistema estadual de
      logística reversa de embalagens, e emita o comprovante oficial.
    </p>

    <form :class="['cx-busca__card', { 'is-shake': shake }]" novalidate @submit.prevent="submit">
      <label class="cx-busca__label" for="cx-cnpj">CNPJ da empresa</label>

      <div class="cx-busca__input">
        <v-icon icon="mdi-office-building-outline" size="20" aria-hidden="true" />
        <input
          id="cx-cnpj"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="00.000.000/0000-00"
          :value="cnpj"
          @input="onInput"
        />
      </div>

      <!-- Captcha mock (visual): clique marca depois de um pequeno delay -->
      <button
        type="button"
        :class="['cx-busca__captcha', { 'is-done': captchaState === 'done' }]"
        :aria-pressed="captchaState === 'done'"
        @click="toggleCaptcha"
      >
        <span class="cx-busca__captcha-left">
          <span :class="['cx-busca__checkbox', `is-${captchaState}`]" aria-hidden="true">
            <v-progress-circular
              v-if="captchaState === 'checking'"
              indeterminate
              size="18"
              width="2"
              color="var(--rg-primitive-brand-600)"
            />
            <v-icon v-else-if="captchaState === 'done'" icon="mdi-check-bold" size="18" />
          </span>
          Não sou um robô
        </span>
        <span class="cx-busca__captcha-right" aria-hidden="true">
          <v-icon icon="mdi-refresh" size="24" />
          <small>reCAPTCHA</small>
          <small class="cx-busca__captcha-terms">Privacidade · Termos</small>
        </span>
      </button>

      <p v-if="hint" class="cx-busca__hint" role="alert">{{ hint }}</p>

      <RgButton type="submit" variant="primary" size="lg" block icon="mdi-magnify">
        Consultar situação
      </RgButton>
    </form>

    <p class="cx-busca__trust">
      <v-icon icon="mdi-shield-check-outline" size="18" aria-hidden="true" />
      Consulta gratuita e oficial. Nenhum dado é armazenado.
    </p>

    <RouterLink to="/consulta/validar" class="cx-busca__validar">
      <v-icon icon="mdi-qrcode-scan" size="16" aria-hidden="true" />
      Recebeu uma certidão? Valide o documento
      <v-icon icon="mdi-arrow-right" size="16" aria-hidden="true" />
    </RouterLink>

    <a href="/#enquadramento" class="cx-busca__autodeclara">
      Não sabe se sua empresa se enquadra? Faça a autodeclaração
      <v-icon icon="mdi-arrow-right" size="16" aria-hidden="true" />
    </a>
  </div>
</template>

<style scoped>
.cx-busca {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: var(--rg-space-10);
}

.cx-busca__eyebrow {
  padding: var(--rg-space-2) var(--rg-space-4);
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: var(--rg-primitive-brand-700);
}

.cx-busca__title {
  margin: var(--rg-space-5) 0 0;
  font-size: clamp(32px, 4.5vw, 46px);
  line-height: 1.12;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  text-align: center;
  color: var(--rg-color-text-primary);
}

.cx-busca__title-accent {
  color: var(--rg-primitive-brand-600);
}

.cx-busca__subtitle {
  margin: var(--rg-space-4) 0 0;
  max-width: 640px;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

/* ============ Card ============ */
.cx-busca__card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  width: min(560px, 100%);
  margin-top: var(--rg-space-10);
  padding: var(--rg-space-8);
  border-radius: var(--rg-radius-3xl);
  border: 1px solid var(--rg-primitive-brand-100);
  background-color: var(--rg-color-surface-base);
  box-shadow: var(--rg-elevation-3);
}

.cx-busca__card.is-shake {
  animation: cx-shake 0.4s var(--rg-motion-ease-standard);
}

@keyframes cx-shake {
  20% { transform: translateX(-8px); }
  40% { transform: translateX(7px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(3px); }
}

.cx-busca__label {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.cx-busca__input {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  height: 56px;
  padding-inline: var(--rg-space-4);
  border: 1.5px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-xl);
  background-color: var(--rg-color-surface-base);
  color: var(--rg-color-text-tertiary);
  transition: border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-busca__input:focus-within {
  border-color: var(--rg-primitive-brand-500);
}

.cx-busca__input input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: var(--rg-font-size-md);
  color: var(--rg-color-text-primary);
  font-variant-numeric: tabular-nums;
}

.cx-busca__input input::placeholder {
  color: var(--rg-color-text-tertiary);
}

/* ============ Captcha mock ============ */
.cx-busca__captcha {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-4);
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

.cx-busca__captcha.is-done {
  border-color: var(--rg-primitive-brand-100);
  cursor: default;
}

.cx-busca__captcha-left {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-3);
}

.cx-busca__checkbox {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 2px solid var(--rg-color-border-strong);
  border-radius: var(--rg-radius-sm);
  color: var(--rg-primitive-brand-600);
  transition: border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-busca__checkbox.is-checking {
  border-color: transparent;
}

.cx-busca__checkbox.is-done {
  border-color: var(--rg-primitive-brand-600);
  animation: cx-pop 0.3s var(--rg-motion-ease-emphasized);
}

@keyframes cx-pop {
  0% { transform: scale(0.7); }
  60% { transform: scale(1.12); }
  100% { transform: scale(1); }
}

.cx-busca__captcha-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  color: var(--rg-primitive-brand-500);
}

.cx-busca__captcha-right small {
  font-size: 9px;
  color: var(--rg-color-text-tertiary);
}

.cx-busca__captcha-terms {
  font-size: 8px !important;
}

.cx-busca__hint {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-primitive-red-600);
}

/* ============ Abaixo do card ============ */
.cx-busca__trust {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin: var(--rg-space-5) 0 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
}

.cx-busca__trust .v-icon {
  color: var(--rg-primitive-brand-500);
}

.cx-busca__validar {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-4);
  padding: var(--rg-space-2) var(--rg-space-4);
  border-radius: var(--rg-radius-pill);
  border: 1px solid var(--rg-primitive-brand-100);
  background-color: var(--rg-color-surface-base);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-brand-700);
  text-decoration: none;
  transition:
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-busca__validar:hover {
  background-color: var(--rg-primitive-brand-50);
  box-shadow: var(--rg-elevation-1);
}

.cx-busca__autodeclara {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-4);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-brand-700);
  text-decoration: none;
}

.cx-busca__autodeclara:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .cx-busca__card {
    padding: var(--rg-space-5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cx-busca__card.is-shake,
  .cx-busca__checkbox.is-done {
    animation: none !important;
  }
}
</style>
