<script setup lang="ts">
import { howItWorksSteps } from '@/data/mocks/landing';
</script>

<template>
  <section id="como-funciona" class="rg-how" aria-labelledby="rg-how-title">
    <div class="rg-how__inner">
      <!-- Header com layout split: eyebrow+título à esquerda; subtítulo descritivo à direita -->
      <header class="rg-how__header">
        <div class="rg-how__heading">
          <span class="rg-how__eyebrow">COMO FUNCIONA</span>
          <h2 id="rg-how-title" class="rg-how__title">
            <span class="rg-how__title-line">Três passos simples</span>
            <span class="rg-how__title-line">para começar.</span>
          </h2>
        </div>
        <p class="rg-how__intro">
          <span class="rg-how__intro-text">
            Da criação<br />
            da conta ao<br />
            acompanhamento<br />
            das obrigações.
          </span>
          <span class="rg-how__intro-rule" aria-hidden="true" />
        </p>
      </header>

      <div class="rg-how__body">
        <!-- Linha superior · bullets numerados com conectores -->
        <div class="rg-how__bullets" aria-hidden="true">
          <span class="rg-how__line" />
          <span class="rg-how__check" style="left: 33.333%">
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" fill="currentColor"/>
            </svg>
          </span>
          <span class="rg-how__check" style="left: 66.666%">
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" fill="currentColor"/>
            </svg>
          </span>
          <span class="rg-how__arrow">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M5 12h14m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <div class="rg-how__bullets-grid">
            <div v-for="step in howItWorksSteps" :key="step.number" class="rg-how__bullet">
              <span class="rg-how__bullet-inner">{{ step.number }}</span>
            </div>
          </div>
        </div>

        <!-- Linha inferior · cards -->
        <ol class="rg-how__cards">
          <li v-for="step in howItWorksSteps" :key="step.number" class="rg-how__card">
            <span class="rg-how__icon" aria-hidden="true">
              <v-icon :icon="step.icon" size="28" />
            </span>
            <h3 class="rg-how__card-title">{{ step.title }}</h3>
            <p class="rg-how__card-desc">{{ step.description }}</p>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-how {
  /* Verde muito claro do Figma (in-between branco e brand-50). Local porque é
     exclusivo desta section + dos chips de check; se aparecer em uma 3ª seção
     vira candidato a `--rg-color-surface-soft-tint` no DS. */
  --rg-how-bg-tint: #F1F7F3;

  position: relative;
  /* Padding vertical 96px — 16px a mais pra respiro entre seções. */
  padding: var(--rg-space-24) var(--rg-space-6);
  background-color: var(--rg-how-bg-tint);
}

.rg-how__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-12);
}

/* ===== Header split: heading à esquerda · intro à direita ===== */
.rg-how__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: var(--rg-space-10);
}

.rg-how__heading {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-how__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-how__title {
  margin: 0;
  display: flex;
  flex-direction: column;
  font-size: 56px;
  line-height: 1.05;
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
  letter-spacing: var(--rg-letter-spacing-tight);
  max-width: 18ch;
}

/* Cada linha do título em bloco — quebra "Três passos simples" / "para começar." */
.rg-how__title-line {
  display: block;
}

.rg-how__intro {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--rg-space-3);
  /* Caixa estreita força quebras verticais — mais altura, menos largura, igual ao Figma. */
  max-width: 220px;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
  text-align: right;
  line-height: 1.4;
}

.rg-how__intro-text {
  display: block;
}

.rg-how__intro-rule {
  display: block;
  width: 40px;
  height: 2px;
  background-color: var(--rg-color-action-primary);
  border-radius: 2px;
}

/* ===== Body ===== */
.rg-how__body {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
}

/* ===== Bullets superiores ===== */
.rg-how__bullets {
  position: relative;
  height: 64px;
}

.rg-how__line {
  position: absolute;
  top: 50%;
  left: 16.666%;
  right: 8%;
  border-top: 2px dashed var(--rg-color-border-base);
  transform: translateY(-50%);
}

.rg-how__check {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--rg-how-bg-tint);
  border: 2px solid var(--rg-color-action-primary);
  border-radius: var(--rg-radius-pill);
  color: var(--rg-color-action-primary);
}

.rg-how__arrow {
  position: absolute;
  top: 50%;
  right: 2%;
  transform: translateY(-50%);
  color: var(--rg-color-border-strong);
}

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
  width: 56px;
  height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-how-bg-tint);
}

.rg-how__bullet-inner {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--rg-radius-pill);
  background-image: linear-gradient(
    135deg,
    var(--rg-primitive-brand-400) 0%,
    var(--rg-primitive-brand-600) 50%,
    var(--rg-primitive-brand-800) 100%
  );
  color: white;
  font-size: 16px;
  font-weight: var(--rg-font-weight-bold);
  box-shadow:
    0 5px 12px rgba(31, 131, 68, 0.32),
    0 0 0 0.5px rgba(255, 255, 255, 0.1) inset;
}

/* ===== Cards inferiores ===== */
.rg-how__cards {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--rg-space-4);
}

.rg-how__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--rg-space-3);
  padding: var(--rg-space-8) var(--rg-space-6);
  background-color: var(--rg-color-surface-base);
  border-radius: var(--rg-radius-2xl);
  text-align: center;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 32px rgba(15, 23, 42, 0.06);
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-how__card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 2px 4px rgba(15, 23, 42, 0.06),
    0 16px 36px rgba(15, 23, 42, 0.1);
}

.rg-how__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  color: var(--rg-color-action-primary);
  margin-bottom: var(--rg-space-2);
}

.rg-how__card-title {
  margin: 0;
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-bold);
  /* Verde escuro brand-900, igual ao título dos cards do "O que é" */
  color: var(--rg-primitive-brand-900);
  letter-spacing: var(--rg-letter-spacing-tight);
}

.rg-how__card-desc {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
  max-width: 26ch;
}

/* ===== Responsivo ===== */
@media (max-width: 960px) {
  .rg-how__header {
    grid-template-columns: 1fr;
    align-items: start;
  }
  .rg-how__intro {
    align-items: flex-start;
    text-align: left;
  }
  .rg-how__title { font-size: clamp(32px, 6vw, 48px); }
}

@media (max-width: 760px) {
  .rg-how__bullets { display: none; }
  .rg-how__cards {
    grid-template-columns: 1fr;
    gap: var(--rg-space-4);
  }
  .rg-how__card { padding: var(--rg-space-6) var(--rg-space-5); }
}
</style>
