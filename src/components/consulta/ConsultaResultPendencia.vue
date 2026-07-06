<script setup lang="ts">
/**
 * Resultado · Com pendência — âmbar de atenção (nunca vermelho).
 *
 * O âmbar aqui é o da tela aprovada no Figma (mais sóbrio que o
 * --rg-primitive-amber do DS, que é saturado demais pra essa página);
 * fica em vars locais --cx-amber-* no escopo do componente.
 */
import RgButton from '@/components/RgButton.vue';
import type { ConsultaEmpresa } from '@/data/mocks/consulta';

defineProps<{ empresa: ConsultaEmpresa; consultaEm: string }>();

const emit = defineEmits<{
  (e: 'relatorio'): void;
  (e: 'nova-consulta'): void;
}>();
</script>

<template>
  <div class="cx-pend">
    <span class="cx-pend__eyebrow">
      <span class="cx-pend__dot" aria-hidden="true" />
      RESULTADO DA CONSULTA
    </span>

    <div class="cx-pend__card">
      <span class="cx-pend__selo" aria-hidden="true">
        <span class="cx-pend__selo-inner">
          <v-icon icon="mdi-alert-circle-outline" size="40" />
        </span>
      </span>

      <span class="cx-pend__badge cx-in" style="--d: 80ms">
        <v-icon icon="mdi-alert-circle-outline" size="14" aria-hidden="true" />
        COM PENDÊNCIA
      </span>

      <h2 class="cx-pend__title cx-in" style="--d: 140ms">
        Empresa com pendências<br />
        no <span class="cx-pend__title-accent">Recicla Goiás</span>
      </h2>

      <p class="cx-pend__subtitle cx-in" style="--d: 200ms">
        Encontramos a empresa no Recicla Goiás, mas há obrigações de logística reversa em aberto.
        Veja o que precisa ser regularizado.
      </p>

      <p class="cx-pend__date cx-in" style="--d: 240ms">Consulta realizada em {{ consultaEm }}.</p>

      <hr class="cx-pend__divider cx-in" style="--d: 280ms" />

      <!-- Identificação -->
      <section class="cx-pend__ident cx-in" style="--d: 320ms" aria-label="Empresa consultada">
        <header>
          <v-icon icon="mdi-office-building-outline" size="18" aria-hidden="true" />
          Empresa consultada
        </header>
        <dl>
          <div><dt>Razão social</dt><dd>{{ empresa.razaoSocial }}</dd></div>
          <div><dt>CNPJ</dt><dd class="cx-num">{{ empresa.cnpj }}</dd></div>
          <div><dt>Município / UF</dt><dd>{{ empresa.municipioUf }}</dd></div>
          <div><dt>Perfil no sistema</dt><dd>{{ empresa.perfil }}</dd></div>
        </dl>
      </section>

      <!-- Pendências -->
      <section class="cx-pend__list cx-in" style="--d: 400ms" aria-label="Pendências identificadas">
        <header>
          <h3>Pendências identificadas</h3>
          <span class="cx-pend__count">{{ empresa.pendencias?.length }} pendências</span>
        </header>

        <ul>
          <li
            v-for="(p, i) in empresa.pendencias"
            :key="p.title"
            class="cx-pend__item"
            :style="{ '--cx-i': i } as Record<string, number>"
          >
            <span class="cx-pend__item-icon" aria-hidden="true">
              <v-icon :icon="p.icon" size="20" />
            </span>
            <div class="cx-pend__item-body">
              <strong>{{ p.title }}</strong>
              <p>{{ p.description }}</p>
              <p class="cx-pend__fix"><strong>Como resolver:</strong> {{ p.howToFix }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- Como regularizar -->
      <section class="cx-pend__reg cx-in" style="--d: 640ms" aria-label="Como regularizar">
        <header>
          <v-icon icon="mdi-shield-check-outline" size="20" aria-hidden="true" />
          Como regularizar
        </header>
        <p>
          Se a empresa é obrigada, é preciso aderir ao sistema de logística reversa, coletivo por
          meio de uma entidade gestora ou individual, e manter as comprovações em dia. Se você
          entende que a empresa não se enquadra, formalize pela Autodeclaração de Não
          Enquadramento.
        </p>
        <a href="/#autodeclaracao" class="cx-pend__reg-link">
          <v-icon icon="mdi-file-document-outline" size="16" aria-hidden="true" />
          Autodeclaração de Não Enquadramento
        </a>
      </section>

      <!-- Aviso legal -->
      <p class="cx-pend__legal cx-in" style="--d: 700ms">
        <v-icon icon="mdi-information-outline" size="16" aria-hidden="true" />
        Consulta orientativa. O descumprimento das obrigações de logística reversa pode sujeitar a
        empresa às penalidades da Lei federal nº 9.605/1998 e do Decreto federal nº 6.514/2008.
        Situação oficial e prazos são definidos pelo comitê gestor.
      </p>

      <!-- Ações -->
      <div class="cx-pend__ctas cx-in" style="--d: 760ms">
        <RgButton
          variant="primary"
          size="lg"
          icon-right="mdi-arrow-right"
          class="cx-pend__cta-main"
          href="/#sistema"
        >
          Regularizar situação
        </RgButton>
        <RgButton variant="secondary" size="lg" icon="mdi-download-outline" @click="emit('relatorio')">
          Baixar relatório (PDF)
        </RgButton>
      </div>
      <RgButton variant="ghost" size="md" icon="mdi-refresh" block @click="emit('nova-consulta')">
        Nova consulta
      </RgButton>
    </div>
  </div>
</template>

<style scoped>
.cx-pend {
  /* Âmbar sóbrio da tela (aprovado no Figma; difere do amber saturado do DS) */
  --cx-amber-50: #fbf4e6;
  --cx-amber-100: #f5e6c8;
  --cx-amber-border: #f0e4cc;
  --cx-amber-500: #e0a63b;
  --cx-amber-600: #b8791b;

  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: var(--rg-space-10);
}

.cx-pend__eyebrow {
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

.cx-pend__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-600);
}

.cx-pend__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(640px, 100%);
  margin-top: var(--rg-space-7);
  padding: var(--rg-space-8);
  border-radius: var(--rg-radius-3xl);
  border: 1px solid var(--cx-amber-100);
  background-color: var(--rg-color-surface-base);
  box-shadow: var(--rg-elevation-3);
}

/* ============ Selo ============ */
.cx-pend__selo {
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--cx-amber-50);
  animation: cx-selo-pop 0.5s var(--rg-motion-ease-emphasized);
}

.cx-pend__selo-inner {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--cx-amber-500);
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

.cx-pend__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-5);
  padding: var(--rg-space-2) var(--rg-space-3);
  border-radius: var(--rg-radius-pill);
  background-color: var(--cx-amber-500);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  color: var(--rg-primitive-neutral-0);
}

.cx-pend__title {
  margin: var(--rg-space-4) 0 0;
  font-size: var(--rg-font-size-3xl);
  line-height: var(--rg-line-height-tight);
  font-weight: var(--rg-font-weight-bold);
  text-align: center;
  color: var(--rg-color-text-primary);
}

.cx-pend__title-accent {
  color: var(--rg-primitive-brand-600);
}

.cx-pend__subtitle {
  margin: var(--rg-space-4) 0 0;
  max-width: 560px;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

.cx-pend__date {
  margin: var(--rg-space-3) 0 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
}

.cx-pend__divider {
  width: 100%;
  margin: var(--rg-space-6) 0;
  border: none;
  border-top: 1px solid var(--rg-color-border-base);
}

/* ============ Identificação (mesmo padrão do Regular) ============ */
.cx-pend__ident {
  width: 100%;
  padding: var(--rg-space-5);
  border-radius: var(--rg-radius-2xl);
  background-color: var(--rg-color-surface-soft-tint);
}

.cx-pend__ident header {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.cx-pend__ident header .v-icon {
  color: var(--rg-primitive-brand-700);
}

.cx-pend__ident dl {
  margin: var(--rg-space-4) 0 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.cx-pend__ident dl > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--rg-space-4);
}

.cx-pend__ident dt {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
  white-space: nowrap;
}

.cx-pend__ident dd {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  text-align: right;
  color: var(--rg-color-text-primary);
}

.cx-num {
  font-variant-numeric: tabular-nums;
}

/* ============ Pendências ============ */
.cx-pend__list {
  width: 100%;
  margin-top: var(--rg-space-6);
}

.cx-pend__list > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-4);
}

.cx-pend__list h3 {
  margin: 0;
  font-size: var(--rg-font-size-lg);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.cx-pend__count {
  padding: var(--rg-space-1) var(--rg-space-3);
  border-radius: var(--rg-radius-pill);
  background-color: var(--cx-amber-50);
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--cx-amber-600);
}

.cx-pend__list ul {
  list-style: none;
  margin: var(--rg-space-4) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
}

.cx-pend__item {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-4);
  padding: var(--rg-space-4);
  border: 1px solid var(--cx-amber-border);
  border-radius: var(--rg-radius-xl);
  background-color: var(--rg-color-surface-base);
  /* Entrada em cascata quando o resultado aparece (após o header da lista) */
  animation: cx-item-in 0.5s var(--rg-motion-ease-emphasized) backwards;
  animation-delay: calc(var(--cx-i, 0) * 90ms + 480ms);
}

@keyframes cx-item-in {
  from { opacity: 0; transform: translateY(10px); }
}

.cx-pend__item-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: var(--rg-radius-md);
  background-color: var(--cx-amber-50);
  color: var(--cx-amber-500);
}

.cx-pend__item-body {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  min-width: 0;
}

.cx-pend__item-body strong {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.cx-pend__item-body p {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.cx-pend__fix {
  padding: var(--rg-space-3);
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-soft-tint);
  font-size: var(--rg-font-size-xs) !important;
}

.cx-pend__fix strong {
  font-size: inherit;
  color: var(--rg-primitive-brand-700);
}

/* ============ Como regularizar ============ */
.cx-pend__reg {
  width: 100%;
  margin-top: var(--rg-space-6);
  padding: var(--rg-space-5);
  border-radius: var(--rg-radius-2xl);
  background-color: var(--rg-color-surface-soft-tint);
}

.cx-pend__reg header {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-primitive-brand-900);
}

.cx-pend__reg header .v-icon {
  color: var(--rg-primitive-brand-600);
}

.cx-pend__reg p {
  margin: var(--rg-space-3) 0 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.cx-pend__reg-link {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-3);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-brand-600);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ============ Aviso legal ============ */
.cx-pend__legal {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-2);
  margin: var(--rg-space-5) 0 0;
  font-size: var(--rg-font-size-2xs);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.cx-pend__legal .v-icon {
  flex: none;
  margin-top: 1px;
  color: var(--rg-color-text-tertiary);
}

/* ============ CTAs ============ */
.cx-pend__ctas {
  display: flex;
  align-items: center;
  gap: var(--rg-space-3);
  width: 100%;
  margin-top: var(--rg-space-6);
  margin-bottom: var(--rg-space-2);
}

.cx-pend__cta-main {
  flex: 1;
}

@media (max-width: 640px) {
  .cx-pend__card {
    padding: var(--rg-space-5);
  }
  .cx-pend__ident dl > div {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
  .cx-pend__ident dd {
    text-align: left;
  }
  .cx-pend__ctas {
    flex-direction: column;
    align-items: stretch;
  }
  /* Em coluna, flex: 1 age na VERTICAL e esmaga a altura do botão. */
  .cx-pend__cta-main {
    flex: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cx-pend__selo,
  .cx-pend__item,
  .cx-in {
    animation: none !important;
  }
}
</style>
