<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import { committeeMembers } from '@/data/mocks/landing';
</script>

<template>
  <section id="comite" class="rg-comite" aria-labelledby="rg-comite-title">
    <div class="rg-comite__bg" aria-hidden="true">
      <div class="rg-comite__bg-pattern" />
    </div>
    <div class="rg-comite__inner">
      <RgSectionHeader
        align="center"
        tone="inverse"
        eyebrow="Comitê gestor"
        title="Construído com oito instituições do Estado de Goiás."
        description="A Portaria Intersecretarial nº 01/2021 instituiu o grupo técnico de trabalho para a logística reversa. Cada órgão participa com uma frente específica."
      />

      <ul class="rg-comite__grid" role="list">
        <li v-for="member in committeeMembers" :key="member.short" class="rg-comite__card">
          <span class="rg-comite__icon" aria-hidden="true">
            <v-icon :icon="member.icon" size="22" />
          </span>
          <strong class="rg-comite__short">{{ member.short }}</strong>
          <span class="rg-comite__full">{{ member.full }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.rg-comite {
  position: relative;
  isolation: isolate;
  padding: var(--rg-space-20) var(--rg-space-6);
  color: white;
  background-color: var(--rg-primitive-brand-900);
}

.rg-comite__bg {
  display: none;
}

.rg-comite__bg-pattern {
  display: none;
}

.rg-comite__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

.rg-comite__grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--rg-space-3);
}

.rg-comite__card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  padding: var(--rg-space-5);
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--rg-radius-xl);
  backdrop-filter: blur(6px);
  transition:
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-comite__card:hover {
  background-color: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.28);
  transform: translateY(-2px);
}

.rg-comite__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--rg-radius-lg);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: var(--rg-primitive-brand-100);
  margin-bottom: var(--rg-space-1);
}

.rg-comite__short {
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-bold);
  color: white;
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
}

.rg-comite__full {
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-snug);
  color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 960px) {
  .rg-comite__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 480px) {
  .rg-comite { padding: var(--rg-space-14) var(--rg-space-4); }
  .rg-comite__grid { grid-template-columns: 1fr; }
}
</style>
