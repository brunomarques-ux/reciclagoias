<script setup lang="ts">
/**
 * Aviso de página da Minha Conta do operador: réplica do `FeedbackBanner` da
 * biblioteca no Figma, nos quatro tons.
 *
 * Planning de 13/11/2026 (Figma: seção `6506:4284`): success no cadastro aprovado
 * (L5·1, `6506:4595`), warning no documento perto de vencer (L1·2, `6507:5839`),
 * danger no bloqueio (L1·4, `6507:6227`) e info no documento em conferência (L1·5,
 * `6507:6537`). O sinal do círculo é texto, como no Figma, e fica fora da leitura
 * de tela: o tom já está dito no título.
 *
 * Borda: o Figma usa o degrau 200 de cada rampa, que não existe aqui. Fica o 100.
 */
withDefaults(defineProps<{ tom: 'success' | 'warning' | 'danger' | 'info'; titulo: string; texto: string }>(), {});

const SINAL = { success: '✓', warning: '!', danger: '!', info: 'i' } as const;
</script>

<template>
  <div class="ox-aviso" :class="`ox-aviso--${tom}`" :role="tom === 'danger' ? 'alert' : 'status'">
    <span class="ox-aviso__sinal" aria-hidden="true">{{ SINAL[tom] }}</span>
    <div class="ox-aviso__textos">
      <p class="ox-aviso__titulo">{{ titulo }}</p>
      <p class="ox-aviso__texto">{{ texto }}</p>
    </div>
  </div>
</template>

<style scoped>
.ox-aviso {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  padding: var(--rg-space-4);
  border: 1px solid;
  border-radius: var(--rg-radius-md);
}

.ox-aviso__sinal {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: var(--rg-radius-pill);
  color: var(--rg-primitive-neutral-0);
  font-size: 13px;
  font-weight: var(--rg-font-weight-bold);
  line-height: 1;
}

.ox-aviso__textos {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ox-aviso__titulo {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 20px;
}

.ox-aviso__texto {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
}

.ox-aviso--success {
  background: var(--rg-color-surface-brand);
  border-color: var(--rg-primitive-brand-100);
  color: var(--rg-color-text-brand);
}

.ox-aviso--success .ox-aviso__sinal {
  background: var(--rg-color-feedback-success);
}

.ox-aviso--warning {
  background: var(--rg-color-feedback-warning-soft);
  border-color: var(--rg-primitive-amber-100);
  color: var(--rg-primitive-amber-700);
}

.ox-aviso--warning .ox-aviso__sinal {
  background: var(--rg-color-feedback-warning);
}

.ox-aviso--danger {
  background: var(--rg-color-feedback-danger-soft);
  border-color: var(--rg-primitive-red-100);
  color: var(--rg-primitive-red-700);
}

.ox-aviso--danger .ox-aviso__sinal {
  background: var(--rg-color-feedback-danger);
}

.ox-aviso--info {
  background: var(--rg-color-feedback-info-soft);
  border-color: var(--rg-primitive-blue-100);
  color: var(--rg-primitive-blue-700);
}

.ox-aviso--info .ox-aviso__sinal {
  background: var(--rg-color-feedback-info);
}
</style>
