<script setup lang="ts">
/**
 * Resultado · Não encontrado — tom neutro/calmo (não é erro assustador).
 * O CNPJ pode não constar porque a empresa não aderiu, não se enquadra
 * ou foi digitado errado; o card orienta os três caminhos.
 */
import RgButton from '@/components/RgButton.vue';

defineProps<{ cnpj: string }>();

const emit = defineEmits<{ (e: 'nova-consulta'): void }>();
</script>

<template>
  <div class="cx-nf">
    <span class="cx-nf__eyebrow">
      <span class="cx-nf__dot" aria-hidden="true" />
      RESULTADO DA CONSULTA
    </span>

    <div class="cx-nf__card">
      <span class="cx-nf__selo" aria-hidden="true">
        <span class="cx-nf__selo-inner">
          <v-icon icon="mdi-magnify-close" size="36" />
        </span>
      </span>

      <span class="cx-nf__badge cx-in" style="--d: 80ms">
        <v-icon icon="mdi-information-outline" size="14" aria-hidden="true" />
        NÃO ENCONTRADO
      </span>

      <h2 class="cx-nf__title cx-in" style="--d: 140ms">
        Não encontramos este CNPJ<br />
        no <span class="cx-nf__title-accent">Recicla Goiás</span>
      </h2>

      <p class="cx-nf__subtitle cx-in" style="--d: 200ms">
        O CNPJ consultado não consta na base do Recicla Goiás. Isso pode significar que a empresa
        ainda não aderiu a um sistema de logística reversa, ou que houve um erro de digitação.
      </p>

      <span class="cx-nf__cnpj cx-in" style="--d: 260ms">
        <v-icon icon="mdi-office-building-outline" size="16" aria-hidden="true" />
        <small>CNPJ</small>
        {{ cnpj }}
      </span>

      <hr class="cx-nf__divider" />

      <section class="cx-nf__help cx-in" style="--d: 340ms" aria-label="O que você pode fazer">
        <h3>O que você pode fazer</h3>
        <ul>
          <li>
            <v-icon icon="mdi-information-outline" size="18" aria-hidden="true" />
            <span>Verifique se o CNPJ foi digitado corretamente e tente novamente.</span>
          </li>
          <li>
            <v-icon icon="mdi-information-outline" size="18" aria-hidden="true" />
            <span>
              Se a empresa gera embalagens em Goiás, ela provavelmente precisa aderir.
              <a href="/#como-funciona">Veja como começar</a>.
            </span>
          </li>
          <li>
            <v-icon icon="mdi-information-outline" size="18" aria-hidden="true" />
            <span>
              Se você entende que a empresa não se enquadra, formalize pela
              <a href="/#autodeclaracao">Autodeclaração de Não Enquadramento</a>.
            </span>
          </li>
        </ul>
      </section>

      <div class="cx-nf__cta cx-in" style="--d: 420ms">
        <RgButton variant="primary" size="lg" icon="mdi-refresh" block @click="emit('nova-consulta')">
          Nova consulta
        </RgButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cx-nf {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: var(--rg-space-10);
}

.cx-nf__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-2) var(--rg-space-4);
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: var(--rg-primitive-brand-700);
}

.cx-nf__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-600);
}

.cx-nf__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(640px, 100%);
  margin-top: var(--rg-space-7);
  padding: var(--rg-space-8);
  border-radius: var(--rg-radius-3xl);
  border: 1px solid var(--rg-color-border-base);
  background-color: var(--rg-color-surface-base);
  box-shadow: var(--rg-elevation-3);
}

.cx-nf__selo {
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-neutral-100);
  animation: cx-selo-pop 0.5s var(--rg-motion-ease-emphasized);
}

.cx-nf__selo-inner {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-neutral-200);
  color: var(--rg-primitive-neutral-500);
}

@keyframes cx-selo-pop {
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); }
}

/* Entrada em cascata dos blocos do card (--d = delay por bloco) */
.cx-in {
  animation: cx-fade-up 0.45s var(--rg-motion-ease-emphasized) backwards;
  animation-delay: var(--d, 0ms);
}

@keyframes cx-fade-up {
  from { opacity: 0; transform: translateY(10px); }
}

.cx-nf__cta {
  width: 100%;
}

.cx-nf__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-5);
  padding: var(--rg-space-2) var(--rg-space-3);
  border-radius: var(--rg-radius-pill);
  border: 1px solid var(--rg-primitive-neutral-200);
  background-color: var(--rg-primitive-neutral-100);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: var(--rg-primitive-neutral-500);
}

.cx-nf__title {
  margin: var(--rg-space-4) 0 0;
  font-size: var(--rg-font-size-3xl);
  line-height: var(--rg-line-height-tight);
  font-weight: var(--rg-font-weight-bold);
  text-align: center;
  color: var(--rg-color-text-primary);
}

.cx-nf__title-accent {
  color: var(--rg-primitive-brand-600);
}

.cx-nf__subtitle {
  margin: var(--rg-space-4) 0 0;
  max-width: 560px;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

.cx-nf__cnpj {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-5);
  padding: var(--rg-space-2) var(--rg-space-4);
  border-radius: var(--rg-radius-lg);
  border: 1px solid var(--rg-color-border-base);
  background-color: var(--rg-color-surface-soft-tint);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  font-variant-numeric: tabular-nums;
  color: var(--rg-color-text-primary);
}

.cx-nf__cnpj small {
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  color: var(--rg-color-text-secondary);
}

.cx-nf__cnpj .v-icon {
  color: var(--rg-color-text-secondary);
}

.cx-nf__divider {
  width: 100%;
  margin: var(--rg-space-6) 0;
  border: none;
  border-top: 1px solid var(--rg-color-surface-muted);
}

/* ============ Orientações ============ */
.cx-nf__help {
  width: 100%;
  margin-bottom: var(--rg-space-6);
  padding: var(--rg-space-5);
  border-radius: var(--rg-radius-2xl);
  background-color: var(--rg-color-surface-soft-tint);
}

.cx-nf__help h3 {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.cx-nf__help ul {
  list-style: none;
  margin: var(--rg-space-4) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.cx-nf__help li {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-3);
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.cx-nf__help li .v-icon {
  flex: none;
  margin-top: 2px;
  color: var(--rg-color-text-tertiary);
}

.cx-nf__help a {
  color: var(--rg-primitive-brand-700);
  font-weight: var(--rg-font-weight-semibold);
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 640px) {
  .cx-nf__card {
    padding: var(--rg-space-5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cx-nf__selo,
  .cx-in {
    animation: none !important;
  }
}
</style>
