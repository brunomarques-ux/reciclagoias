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

      <div class="rg-how__body">
        <!-- Linha superior · bullets numerados com conectores -->
        <div class="rg-how__bullets" aria-hidden="true">
          <span class="rg-how__line" />
          <span class="rg-how__check" style="left: 33.333%">
            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" fill="currentColor"/></svg>
          </span>
          <span class="rg-how__check" style="left: 66.666%">
            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" fill="currentColor"/></svg>
          </span>
          <span class="rg-how__arrow">
            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 12h14m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <div class="rg-how__bullets-grid">
            <div v-for="step in howItWorksSteps" :key="step.number" class="rg-how__bullet">
              <span class="rg-how__bullet-inner">{{ step.number }}</span>
            </div>
          </div>
        </div>

        <!-- Linha inferior · cards fill container alinhados aos bullets -->
        <ol class="rg-how__cards">
          <li
            v-for="step in howItWorksSteps"
            :key="step.number"
            class="rg-how__card"
          >
            <span class="rg-how__icon" aria-hidden="true">
              <v-icon :icon="step.icon" size="36" />
            </span>
            <h3 class="rg-how__title">{{ step.title }}</h3>
            <p class="rg-how__desc">{{ step.description }}</p>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-how {
  position: relative;
  padding: var(--rg-space-20) var(--rg-space-6);
  background-color: var(--rg-color-surface-muted);
}

.rg-how__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

.rg-how__body {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-8);
}

/* ===== Linha superior · bullets ===== */
.rg-how__bullets {
  position: relative;
  height: 96px;
}

/* Linha tracejada horizontal cobrindo todo o eixo */
.rg-how__line {
  position: absolute;
  top: 50%;
  left: 16.666%;
  right: 8%;
  border-top: 2px dashed var(--rg-color-border-base);
  transform: translateY(-50%);
}

/* Check circular no meio de cada conexão */
.rg-how__check {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--rg-color-surface-base);
  border: 2px solid var(--rg-color-action-primary);
  border-radius: var(--rg-radius-pill);
  color: var(--rg-color-action-primary);
}

/* Seta no final */
.rg-how__arrow {
  position: absolute;
  top: 50%;
  right: 2%;
  transform: translateY(-50%);
  color: var(--rg-color-border-strong);
}

/* Grid dos bullets numerados (centralizados em cada coluna) */
.rg-how__bullets-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  height: 100%;
  align-items: center;
  justify-items: center;
}

.rg-how__bullet {
  position: relative;
  z-index: 1;
  width: 96px;
  height: 96px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
}

.rg-how__bullet-inner {
  width: 72px;
  height: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--rg-radius-pill);
  /* Gradient verde brand-400 → brand-600 → brand-800 (135deg) */
  background-image: linear-gradient(135deg,
    var(--rg-primitive-brand-400) 0%,
    var(--rg-primitive-brand-600) 50%,
    var(--rg-primitive-brand-800) 100%);
  color: white;
  font-size: 26px;
  font-weight: var(--rg-font-weight-bold);
  box-shadow:
    0 8px 16px rgba(31, 131, 68, 0.35),
    0 0 0 0.5px rgba(255, 255, 255, 0.1) inset;
}

/* ===== Linha inferior · cards ===== */
.rg-how__cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--rg-space-6);
}

.rg-how__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--rg-space-5);
  padding: var(--rg-space-10) var(--rg-space-8);
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
  width: 88px;
  height: 88px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  color: var(--rg-color-action-primary);
}

.rg-how__title {
  margin: 0;
  font-size: var(--rg-font-size-2xl);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-how__desc {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
  max-width: 32ch;
}

@media (max-width: 880px) {
  .rg-how__bullets { display: none; }
  .rg-how__cards {
    grid-template-columns: 1fr;
    gap: var(--rg-space-5);
  }
}
</style>
