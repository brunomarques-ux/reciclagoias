<script setup lang="ts">
/**
 * Resultado · Regular — selo verde, identificação e autenticação.
 * Estrutura espelha o frame "Resultado · Regular" (Figma Julho/26,
 * pós-edições do Bruno: sem bloco "o que foi verificado", sem linha
 * de data, título com "Recicla Goiás" em verde).
 */
import RgButton from '@/components/RgButton.vue';
import type { ConsultaEmpresa } from '@/data/mocks/consulta';

defineProps<{ empresa: ConsultaEmpresa }>();

const emit = defineEmits<{
  (e: 'certidao'): void;
  (e: 'imprimir'): void;
  (e: 'nova-consulta'): void;
}>();
</script>

<template>
  <div class="cx-result">
    <span class="cx-result__eyebrow">
      <span class="cx-result__dot" aria-hidden="true" />
      RESULTADO DA CONSULTA
    </span>

    <div class="cx-result__card">
      <span class="cx-result__selo" aria-hidden="true">
        <span class="cx-result__selo-inner">
          <v-icon icon="mdi-check-circle" size="40" />
        </span>
      </span>

      <span class="cx-result__badge cx-in" style="--d: 80ms">
        <v-icon icon="mdi-check-bold" size="14" aria-hidden="true" />
        SITUAÇÃO REGULAR
      </span>

      <h2 class="cx-result__title cx-in" style="--d: 140ms">
        Empresa regular no <span class="cx-result__title-accent">Recicla Goiás</span>
      </h2>

      <p class="cx-result__subtitle cx-in" style="--d: 200ms">
        A consulta confirma que a empresa está em conformidade com as obrigações de logística
        reversa do Decreto estadual nº 10.255/2023, na data e hora indicadas abaixo.
      </p>

      <hr class="cx-result__divider cx-in" style="--d: 260ms" />

      <!-- Identificação -->
      <section class="cx-result__ident cx-in" style="--d: 300ms" aria-label="Empresa consultada">
        <header>
          <v-icon icon="mdi-office-building-outline" size="18" aria-hidden="true" />
          Empresa consultada
        </header>
        <dl>
          <div><dt>Razão social</dt><dd>{{ empresa.razaoSocial }}</dd></div>
          <div><dt>CNPJ</dt><dd class="cx-num">{{ empresa.cnpj }}</dd></div>
          <div><dt>Município / UF</dt><dd>{{ empresa.municipioUf }}</dd></div>
        </dl>
      </section>

      <!-- Autenticação -->
      <section class="cx-result__auth cx-in" style="--d: 380ms" aria-label="Código de autenticação">
        <div class="cx-result__auth-left">
          <small>CÓDIGO DE AUTENTICAÇÃO</small>
          <strong class="cx-num">{{ empresa.codigoAutenticacao }}</strong>
        </div>
        <span class="cx-result__auth-qr" aria-label="QR Code para validar a consulta">
          <v-icon icon="mdi-qrcode" size="48" />
        </span>
      </section>

      <!-- Ações -->
      <div class="cx-result__ctas cx-in" style="--d: 460ms">
        <RgButton variant="primary" size="lg" icon="mdi-download-outline" class="cx-result__cta-main" @click="emit('certidao')">
          Baixar certidão (PDF)
        </RgButton>
        <RgButton variant="outline" size="lg" icon="mdi-printer-outline" @click="emit('imprimir')">
          Imprimir
        </RgButton>
        <RgButton variant="ghost" size="lg" icon="mdi-refresh" @click="emit('nova-consulta')">
          Nova consulta
        </RgButton>
      </div>

      <p class="cx-result__disclaimer cx-in" style="--d: 540ms">
        Consulta de caráter informativo, gerada a partir dos dados do Sistema Recicla Goiás na
        data e hora indicadas. Não substitui a certidão oficial nem as comprovações exigidas pela
        SEMAD. Para fé pública, baixe a certidão em PDF e valide o código de autenticação.
      </p>
    </div>
  </div>
</template>

<style scoped>
.cx-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: var(--rg-space-10);
}

.cx-result__eyebrow {
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

.cx-result__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-600);
}

.cx-result__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(640px, 100%);
  margin-top: var(--rg-space-7);
  padding: var(--rg-space-8);
  border-radius: var(--rg-radius-3xl);
  border: 1px solid var(--rg-primitive-brand-100);
  background-color: var(--rg-color-surface-base);
  box-shadow: var(--rg-elevation-3);
}

/* ============ Selo ============ */
.cx-result__selo {
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  animation: cx-selo-pop 0.5s var(--rg-motion-ease-emphasized);
}

.cx-result__selo-inner {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-600);
  color: var(--rg-primitive-neutral-0);
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

.cx-result__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-5);
  padding: var(--rg-space-2) var(--rg-space-3);
  border-radius: var(--rg-radius-pill);
  border: 1px solid var(--rg-primitive-brand-100);
  background-color: var(--rg-primitive-brand-50);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: var(--rg-primitive-brand-700);
}

.cx-result__title {
  margin: var(--rg-space-4) 0 0;
  font-size: var(--rg-font-size-3xl);
  line-height: var(--rg-line-height-tight);
  font-weight: var(--rg-font-weight-bold);
  text-align: center;
  color: var(--rg-color-text-primary);
}

.cx-result__title-accent {
  color: var(--rg-primitive-brand-600);
}

.cx-result__subtitle {
  margin: var(--rg-space-4) 0 0;
  max-width: 560px;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

.cx-result__divider {
  width: 100%;
  margin: var(--rg-space-6) 0;
  border: none;
  border-top: 1px solid var(--rg-color-surface-muted);
}

/* ============ Identificação ============ */
.cx-result__ident {
  width: 100%;
  padding: var(--rg-space-5);
  border-radius: var(--rg-radius-2xl);
  background-color: var(--rg-color-surface-soft-tint);
}

.cx-result__ident header {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.cx-result__ident header .v-icon {
  color: var(--rg-primitive-brand-700);
}

.cx-result__ident dl {
  margin: var(--rg-space-4) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.cx-result__ident dl > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--rg-space-4);
}

.cx-result__ident dt {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
  white-space: nowrap;
}

.cx-result__ident dd {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  text-align: right;
  color: var(--rg-color-text-primary);
}

.cx-num {
  font-variant-numeric: tabular-nums;
}

/* ============ Autenticação ============ */
.cx-result__auth {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-4);
  width: 100%;
  margin-top: var(--rg-space-5);
  padding: var(--rg-space-5);
  border-radius: var(--rg-radius-2xl);
  background-color: var(--rg-color-surface-soft-tint);
}

.cx-result__auth-left {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  min-width: 0;
}

.cx-result__auth-left small {
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  color: var(--rg-color-text-secondary);
}

.cx-result__auth-left strong {
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-primary);
  overflow-wrap: anywhere;
}

.cx-result__auth-qr {
  display: grid;
  place-items: center;
  flex: none;
  width: 72px;
  height: 72px;
  border-radius: var(--rg-radius-md);
  border: 1px solid var(--rg-color-border-base);
  background-color: var(--rg-color-surface-base);
  color: var(--rg-color-text-primary);
}

/* ============ CTAs ============ */
.cx-result__ctas {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  width: 100%;
  margin-top: var(--rg-space-6);
}

.cx-result__cta-main {
  flex: 1;
}

.cx-result__disclaimer {
  margin: var(--rg-space-5) 0 0;
  max-width: 560px;
  font-size: var(--rg-font-size-2xs);
  line-height: var(--rg-line-height-relaxed);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

@media (max-width: 640px) {
  .cx-result__card {
    padding: var(--rg-space-5);
  }
  .cx-result__ident dl > div {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  .cx-result__ident dd {
    text-align: left;
  }
  .cx-result__ctas {
    flex-direction: column;
    align-items: stretch;
  }
  /* Em coluna, flex: 1 age na VERTICAL e esmaga a altura do botão. */
  .cx-result__cta-main {
    flex: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cx-result__selo,
  .cx-in {
    animation: none !important;
  }
}
</style>
