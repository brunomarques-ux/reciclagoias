<script setup lang="ts">
import RgSectionHeader from '@/components/RgSectionHeader.vue';
import { howItWorksSteps } from '@/data/mocks/landing';
</script>

<template>
  <section id="como-funciona" class="rg-how" aria-labelledby="rg-how-title">
    <div class="rg-how__inner">
      <RgSectionHeader
        align="center"
        eyebrow="Como funciona"
        title="Três passos simples para começar."
        description="Da criação da conta ao acompanhamento das obrigações, todo o processo acontece dentro do sistema."
      />

      <ol class="rg-how__list">
        <li
          v-for="(step, idx) in howItWorksSteps"
          :key="step.number"
          class="rg-how__item"
        >
          <span class="rg-how__connector" v-if="idx < howItWorksSteps.length - 1" aria-hidden="true" />
          <span class="rg-how__number" aria-hidden="true">{{ step.number }}</span>
          <div class="rg-how__card">
            <span class="rg-how__icon" aria-hidden="true">
              <v-icon :icon="step.icon" size="26" />
            </span>
            <h3 class="rg-how__title">{{ step.title }}</h3>
            <p class="rg-how__desc">{{ step.description }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.rg-how {
  position: relative;
  padding: var(--rg-space-20) var(--rg-space-6);
  background:
    linear-gradient(180deg, var(--rg-color-surface-base) 0%, var(--rg-color-surface-muted) 100%);
}

.rg-how__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

.rg-how__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--rg-space-6);
}

.rg-how__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: var(--rg-space-6);
}

.rg-how__connector {
  position: absolute;
  top: 24px;
  left: calc(50% + 28px);
  width: calc(100% - 56px);
  height: 0;
  border-top: 2px dashed var(--rg-color-border-base);
  z-index: 0;
}

.rg-how__number {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-action-primary);
  color: white;
  font-size: var(--rg-font-size-lg);
  font-weight: var(--rg-font-weight-bold);
  box-shadow: 0 6px 24px rgba(31, 131, 68, 0.25);
  margin-bottom: var(--rg-space-2);
}

.rg-how__card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--rg-space-2);
  padding: var(--rg-space-6) var(--rg-space-5);
  background-color: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-2xl);
  text-align: center;
  box-shadow: var(--rg-elevation-1);
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-how__card:hover {
  transform: translateY(-3px);
  box-shadow: var(--rg-elevation-3);
  border-color: var(--rg-color-border-base);
}

.rg-how__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--rg-radius-pill);
  background: linear-gradient(135deg, var(--rg-primitive-brand-50), var(--rg-primitive-brand-100));
  color: var(--rg-color-action-primary);
  margin-bottom: var(--rg-space-2);
}

.rg-how__title {
  margin: 0;
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-how__desc {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

@media (max-width: 880px) {
  .rg-how__list {
    grid-template-columns: 1fr;
    gap: var(--rg-space-5);
  }
  .rg-how__connector {
    display: none;
  }
}
</style>
