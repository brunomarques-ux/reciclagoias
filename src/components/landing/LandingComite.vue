<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import { committeeMembers } from '@/data/mocks/landing';
</script>

<template>
  <section id="comite" class="rg-comite" aria-labelledby="rg-comite-title">
    <div class="rg-comite__inner">
      <RgSectionHeader
        align="center"
        tone="inverse"
        eyebrow="Comitê gestor"
        title="Construído com oito instituições do Estado de Goiás."
        description="A Portaria Intersecretarial nº 01/2021 instituiu o grupo técnico de trabalho para a logística reversa. Cada órgão participa com uma frente específica."
      />

      <ul class="rg-comite__table" role="list">
        <li v-for="member in committeeMembers" :key="member.short" class="rg-comite__row">
          <!-- Col 1 · Ícone -->
          <span class="rg-comite__icon" aria-hidden="true">
            <v-icon :icon="member.icon" size="26" />
          </span>

          <!-- Col 2 · Nome completo -->
          <span class="rg-comite__name">{{ member.full }}</span>

          <!-- Col 3 · Sigla -->
          <span class="rg-comite__sigla">{{ member.short }}</span>

          <!-- Col 4 · Link externo -->
          <a
            :href="member.url ?? '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="rg-comite__link"
            :aria-label="`Acessar site de ${member.short}`"
          >
            <v-icon icon="mdi-open-in-new" size="18" />
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.rg-comite {
  position: relative;
  padding: var(--rg-space-20) var(--rg-space-6);
  color: white;
  background-color: var(--rg-primitive-brand-900);
}

.rg-comite__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

.rg-comite__table {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.rg-comite__row {
  display: grid;
  grid-template-columns: 56px 1fr 220px 40px;
  align-items: center;
  gap: var(--rg-space-6);
  padding: var(--rg-space-6) var(--rg-space-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-comite__row:last-child {
  border-bottom: none;
}

.rg-comite__row:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

/* Col 1 · Ícone */
.rg-comite__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--rg-primitive-brand-200);
}

/* Col 2 · Nome completo */
.rg-comite__name {
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: white;
  line-height: var(--rg-line-height-snug);
}

/* Col 3 · Sigla pill */
.rg-comite__sigla {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  padding: 4px 12px;
  border-radius: var(--rg-radius-pill);
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--rg-primitive-brand-200);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  white-space: nowrap;
}

/* Col 4 · Link externo */
.rg-comite__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--rg-radius-md);
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--rg-primitive-brand-200);
  text-decoration: none;
  transition:
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.rg-comite__link:hover {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.32);
  color: white;
  transform: translateY(-1px);
}

.rg-comite__link:focus-visible {
  outline: 2px solid var(--rg-primitive-brand-300);
  outline-offset: 2px;
}

@media (max-width: 720px) {
  .rg-comite { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-comite__row {
    grid-template-columns: 48px 1fr 40px;
    gap: var(--rg-space-3);
    padding: var(--rg-space-4) var(--rg-space-3);
  }
  .rg-comite__sigla {
    grid-column: 2;
    grid-row: 2;
    justify-self: start;
    margin-top: 4px;
  }
  .rg-comite__name {
    grid-column: 2;
    grid-row: 1;
  }
  .rg-comite__icon {
    grid-row: 1 / span 2;
    width: 48px;
    height: 48px;
  }
  .rg-comite__link {
    grid-column: 3;
    grid-row: 1 / span 2;
  }
}
</style>
