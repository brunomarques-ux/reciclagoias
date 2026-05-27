<script setup lang="ts">
/**
 * Seção Comitê Gestor — lista das 8 instituições do estado de Goiás que
 * compõem o comitê. Versão light-theme (background --rg-color-surface-base,
 * igual ao Reconhecimento), com o "8" destacado em verde brand no título.
 *
 * Ícones MDI mantidos da versão anterior porque o Figma exporta esses ícones
 * quebrados — o conjunto MDI (leaf, factory, trending-up, bank-outline, etc)
 * mapeia 1:1 com a intenção do design.
 */
import { committeeMembers } from '@/data/mocks/landing';
</script>

<template>
  <section id="comite" class="rg-comite" aria-labelledby="rg-comite-title">
    <div class="rg-comite__inner">
      <!-- Header com "8" destacado em verde brand -->
      <header class="rg-comite__header">
        <span class="rg-comite__eyebrow">COMITÊ GESTOR</span>
        <h2 id="rg-comite-title" class="rg-comite__title">
          <span class="rg-comite__title-line">Construído com</span>
          <span class="rg-comite__title-line">
            <span class="rg-comite__title-number">8</span>
            instituições
          </span>
          <span class="rg-comite__title-line">do Estado de Goiás.</span>
        </h2>
      </header>

      <!-- Lista das 8 instituições -->
      <ul class="rg-comite__list" role="list">
        <li v-for="member in committeeMembers" :key="member.short" class="rg-comite__row">
          <!-- Col 1 · Ícone em chip verde clarinho -->
          <span class="rg-comite__icon-chip" aria-hidden="true">
            <v-icon :icon="member.icon" size="26" />
          </span>

          <!-- Col 2 · Nome completo -->
          <span class="rg-comite__name">{{ member.full }}</span>

          <!-- Col 3 · Sigla pill -->
          <span class="rg-comite__sigla">{{ member.short }}</span>

          <!-- Col 4 · Link externo (ícone só, sem botão wrapper) -->
          <a
            :href="member.url ?? '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="rg-comite__link"
            :aria-label="`Acessar site de ${member.short}`"
          >
            <v-icon icon="mdi-open-in-new" size="20" />
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.rg-comite {
  position: relative;
  /* Padding consistente com as demais seções (96px = --rg-space-24). */
  padding: var(--rg-space-24) var(--rg-space-6);
  /* Background igual ao Reconhecimento (branco/surface-base), conforme Figma. */
  background-color: var(--rg-color-surface-base);
  color: var(--rg-color-text-primary);
}

.rg-comite__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

/* ============ Header ============ */
.rg-comite__header {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-comite__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-comite__title {
  margin: 0;
  display: flex;
  flex-direction: column;
  /* Sem gap entre as linhas — o line-height já cuida disso.
     56px exato conforme Figma node 17-608 (sem clamp em desktop;
     a versão mobile no @media reduz pra clamp). */
  font-size: 56px;
  line-height: 1.05;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.rg-comite__title-line {
  display: inline-flex;
  align-items: baseline;
  gap: var(--rg-space-3);
  flex-wrap: wrap;
}

/* O "8" destacado em verde brand-500. */
.rg-comite__title-number {
  color: var(--rg-primitive-brand-500);
}

/* ============ Lista ============ */
.rg-comite__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.rg-comite__row {
  display: grid;
  /* 4 colunas: ícone fixo | nome (cresce) | sigla pill | link externo */
  grid-template-columns: 56px 1fr auto 24px;
  align-items: center;
  gap: var(--rg-space-6);
  padding: var(--rg-space-5) var(--rg-space-2);
  border-bottom: 1px solid var(--rg-primitive-brand-100);
  transition: background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-comite__row:last-child {
  border-bottom: none;
}

.rg-comite__row:hover {
  background-color: var(--rg-primitive-brand-50);
}

/* Col 1 · Ícone wrapper retangular verde claro com borda */
.rg-comite__icon-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-primitive-brand-50);
  border: 1px solid var(--rg-primitive-brand-200);
  color: var(--rg-primitive-brand-600);
}

/* Col 2 · Nome completo da instituição */
.rg-comite__name {
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  line-height: var(--rg-line-height-snug);
}

/* Col 3 · Sigla pill verde claro */
.rg-comite__sigla {
  display: inline-flex;
  align-items: center;
  justify-self: end;
  padding: 4px 12px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  color: var(--rg-primitive-brand-700);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  white-space: nowrap;
}

/* Col 4 · Link externo (só ícone, sem botão visível) */
.rg-comite__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--rg-primitive-brand-600);
  text-decoration: none;
  transition:
    color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-comite__link:hover {
  color: var(--rg-primitive-brand-800);
  transform: translateY(-1px);
}

.rg-comite__link:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 4px;
  border-radius: var(--rg-radius-xs);
}

/* ============ Responsivo ============ */
@media (max-width: 768px) {
  .rg-comite {
    padding: var(--rg-space-16) var(--rg-space-4);
  }
  .rg-comite__title {
    font-size: clamp(28px, 7vw, 42px);
  }
  .rg-comite__row {
    grid-template-columns: 48px 1fr 24px;
    grid-template-rows: auto auto;
    gap: var(--rg-space-3) var(--rg-space-4);
    padding: var(--rg-space-4) var(--rg-space-2);
  }
  .rg-comite__icon-chip {
    grid-row: 1 / span 2;
    width: 48px;
    height: 48px;
  }
  .rg-comite__name {
    grid-column: 2;
    grid-row: 1;
    font-size: var(--rg-font-size-sm);
  }
  .rg-comite__sigla {
    grid-column: 2;
    grid-row: 2;
    justify-self: start;
  }
  .rg-comite__link {
    grid-column: 3;
    grid-row: 1 / span 2;
    align-self: center;
  }
}
</style>
