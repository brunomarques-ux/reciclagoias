<script setup lang="ts">
/**
 * Como Funciona — 3 passos com animação sequencial.
 *
 * Fluxo da animação (trigger via IntersectionObserver quando a section
 * entra no viewport com threshold 0.35):
 *
 *   t=0     bolinha #1 cresce (scale 0→1) e preenche de verde   (400ms)
 *   t=400ms card 1 "Cadastre-se" sobe + fade-in                 (400ms)
 *   t=800ms linha tracejada 1→2 preenche da esquerda pra direita (600ms)
 *           + check entre 1 e 2 faz "pop" no meio do preenchimento
 *   t=1.4s  bolinha #2 cresce + card 2 sobe
 *   t=2.2s  linha tracejada 2→3 preenche + check 2 pop
 *   t=2.8s  bolinha #3 cresce + card 3 sobe
 *   t≈3.6s  fim
 *
 * Bullets do lado direito ("Da criação / da conta ao / acompanhamento /
 * das obrigações") entram em ritmo escalonado (stagger 60ms) com
 * blur+translateX+opacity, completando bem cedo na timeline (≤500ms).
 *
 * Tudo via CSS animations com animation-delay — uma única classe
 * `is-animating` aplicada na section dispara a cadeia.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { howItWorksSteps } from '@/data/mocks/landing';

const sectionRef = ref<HTMLElement | null>(null);
const isAnimating = ref(false);
let observer: IntersectionObserver | null = null;

// Frases do intro fragmentadas por linha pra animar uma por uma.
// Mantém o ritmo de 4 linhas curtas, agora generalista (não foca em entidade gestora).
const introLines = [
  'Da escolha',
  'do perfil',
  'ao acesso ao',
  'sistema.',
];

onMounted(() => {
  // Respeita prefers-reduced-motion — mostra tudo no estado final sem animar.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    isAnimating.value = true;
    return;
  }

  if (!sectionRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        isAnimating.value = true;
        observer?.disconnect();
      }
    },
    { threshold: 0.35 },
  );
  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<template>
  <section
    id="como-funciona"
    ref="sectionRef"
    :class="['rg-how', { 'is-animating': isAnimating }]"
    aria-labelledby="rg-how-title"
  >
    <div class="rg-how__inner">
      <!-- Header com layout split: eyebrow+título à esquerda; subtítulo descritivo à direita -->
      <header class="rg-how__header">
        <div class="rg-how__heading">
          <span class="rg-how__eyebrow">COMO FUNCIONA</span>
          <h2 id="rg-how-title" class="rg-how__title">
            <span class="rg-how__title-line">Três passos simples</span>
            <span class="rg-how__title-line">
              para <span class="rg-how__title-accent">começar.</span>
            </span>
          </h2>
        </div>
        <p class="rg-how__intro">
          <span class="rg-how__intro-text">
            <span
              v-for="(line, i) in introLines"
              :key="line"
              class="rg-how__intro-line"
              :style="{ '--rg-line-i': i } as Record<string, string | number>"
            >{{ line }}</span>
          </span>
          <span class="rg-how__intro-rule" aria-hidden="true" />
        </p>
      </header>

      <div class="rg-how__body">
        <!-- Linha superior · bullets numerados com conectores -->
        <div class="rg-how__bullets" aria-hidden="true">
          <!-- Linha tracejada em 3 segmentos (1→2, 2→3, 3→arrow).
               Cada segmento começa invisível e aparece junto com o fill verde
               correspondente, conforme o avanço da animação. -->
          <span class="rg-how__line-dash rg-how__line-dash--1" />
          <span class="rg-how__line-dash rg-how__line-dash--2" />
          <span class="rg-how__line-dash rg-how__line-dash--3" />
          <!-- Segmentos de preenchimento verde (animam scaleX 0→1).
               Terminam exatamente na bolinha seguinte. O segmento 3 vai da
               bolinha 3 até a setinha (parado meio segundo depois do card 3). -->
          <span class="rg-how__line-fill rg-how__line-fill--1" />
          <span class="rg-how__line-fill rg-how__line-fill--2" />
          <span class="rg-how__line-fill rg-how__line-fill--3" />
          <!-- Checks no meio de cada segmento (animam scale 0 → 1.2 → 1 com pop) -->
          <span class="rg-how__check rg-how__check--1">
            <svg viewBox="0 0 24 24" width="12" height="12">
              <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" fill="currentColor"/>
            </svg>
          </span>
          <span class="rg-how__check rg-how__check--2">
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
            <div
              v-for="(step, i) in howItWorksSteps"
              :key="step.number"
              :class="['rg-how__bullet', `rg-how__bullet--${i + 1}`]"
            >
              <span class="rg-how__bullet-inner">{{ step.number }}</span>
            </div>
          </div>
        </div>

        <!-- Linha inferior · cards -->
        <ol class="rg-how__cards">
          <li
            v-for="(step, i) in howItWorksSteps"
            :key="step.number"
            :class="['rg-how__card', `rg-how__card--${i + 1}`]"
          >
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
  /* Verde muito claro do Figma (in-between branco e brand-50). Promovido a
     token do DS na 4ª ocorrência (HowItWorks, FlowDiagram, CtaFinal, Perfis);
     o alias local segue alimentando os chips de check e bullets. */
  --rg-how-bg-tint: var(--rg-color-surface-soft-tint);

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

/* Palavra "começar" destacada em verde brand-500 (Figma). */
.rg-how__title-accent {
  color: var(--rg-primitive-brand-500);
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
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Cada linha do intro entra com blur + translateX + fade, em ritmo escalonado
   (60ms × índice). Estado inicial: invisível e deslocada à direita. */
.rg-how__intro-line {
  display: block;
  opacity: 0;
  transform: translateX(20px);
  filter: blur(8px);
  transition:
    opacity 500ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
  transition-delay: calc(60ms * var(--rg-line-i, 0));
}

.rg-how.is-animating .rg-how__intro-line {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
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

/* Linhas tracejadas em 3 segmentos (1→2, 2→3, 3→arrow).
   Cada uma começa INVISÍVEL e aparece (fade-in) junto com o avanço da
   animação — só vai sendo revelada conforme o usuário "chega" no próximo
   passo. Posições alinham perfeitamente com os bullets (16.666%, 50%,
   83.333%) e a flecha (~92%). */
.rg-how__line-dash {
  position: absolute;
  top: 50%;
  height: 0;
  border-top: 2px dashed var(--rg-color-border-base);
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 200ms ease;
}

.rg-how__line-dash--1 {
  left: 16.666%;
  width: 33.333%;
}

.rg-how__line-dash--2 {
  left: 50%;
  width: 33.333%;
}

.rg-how__line-dash--3 {
  left: 83.333%;
  right: 8%;
}

.rg-how.is-animating .rg-how__line-dash--1 {
  opacity: 1;
  /* Aparece junto com o fill 1 começar (depois do card 1) */
  transition-delay: 800ms;
}

.rg-how.is-animating .rg-how__line-dash--2 {
  opacity: 1;
  /* Aparece junto com o fill 2 começar (depois do card 2) */
  transition-delay: 2200ms;
}

.rg-how.is-animating .rg-how__line-dash--3 {
  opacity: 1;
  /* Último segmento (sem fill verde — só fica tracejado): aparece junto
     com o card 3 + arrow no fim da animação. */
  transition-delay: 3000ms;
}

/* Segmentos de preenchimento verde que sobrepõem a linha tracejada,
   animando scaleX 0 → 1 com transform-origin left. Largura calculada pra
   terminar EXATAMENTE na bolinha seguinte (sem extrapolar). */
.rg-how__line-fill {
  position: absolute;
  top: 50%;
  height: 2px;
  background-color: var(--rg-primitive-brand-500);
  transform: translateY(-50%) scaleX(0);
  transform-origin: left center;
  transition: transform 600ms cubic-bezier(0.65, 0, 0.35, 1);
  border-radius: 1px;
}

.rg-how__line-fill--1 {
  /* De 16.666% (bullet 1) até 50% (bullet 2) — largura exata 33.333% */
  left: 16.666%;
  width: 33.333%;
}

.rg-how__line-fill--2 {
  /* De 50% (bullet 2) até 83.333% (bullet 3) — largura exata 33.333% */
  left: 50%;
  width: 33.333%;
}

.rg-how__line-fill--3 {
  /* Da bolinha 3 (83.333%) até a setinha (~92%, antes da arrow). */
  left: 83.333%;
  width: calc(92% - 83.333%);
  /* Duração mais curta (~400ms) — é um trechinho pequeno. */
  transition-duration: 400ms;
}

.rg-how.is-animating .rg-how__line-fill--1 {
  transform: translateY(-50%) scaleX(1);
  /* Começa depois do card 1 (400ms bullet + 400ms card = 800ms) */
  transition-delay: 800ms;
}

.rg-how.is-animating .rg-how__line-fill--2 {
  transform: translateY(-50%) scaleX(1);
  /* Começa depois do card 2 (800ms + 600ms linha + 400ms bullet 2 + 400ms card 2 = 2200ms) */
  transition-delay: 2200ms;
}

.rg-how.is-animating .rg-how__line-fill--3 {
  transform: translateY(-50%) scaleX(1);
  /* Espera ~500ms depois do card 3 (3100ms + 500ms = 3600ms) pra dar um
     respiro antes da seta aparecer. */
  transition-delay: 3600ms;
}

.rg-how__check {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--rg-how-bg-tint);
  border: 2px solid var(--rg-color-action-primary);
  border-radius: var(--rg-radius-pill);
  color: var(--rg-color-action-primary);
  opacity: 0;
  /* Pop animation: scale 0 → 1.2 → 1 via cubic-bezier overshoot. */
  transition:
    transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 200ms ease;
}

.rg-how__check--1 { left: 33.333%; }
.rg-how__check--2 { left: 66.666%; }

.rg-how.is-animating .rg-how__check--1 {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  /* Pop no meio do preenchimento da linha 1 (800ms + 300ms ≈ 1100ms) */
  transition-delay: 1100ms;
}

.rg-how.is-animating .rg-how__check--2 {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
  /* Pop no meio do preenchimento da linha 2 (2200ms + 300ms = 2500ms) */
  transition-delay: 2500ms;
}

.rg-how__arrow {
  position: absolute;
  top: 50%;
  right: 2%;
  /* Cor verde brand pra combinar com o fill verde que termina aqui. */
  color: var(--rg-primitive-brand-500);
  opacity: 0;
  /* Fade-in suave; depois disso entra no @keyframes rg-arrow-pulse. */
  transform: translateY(-50%) translateX(0);
  transition: opacity 400ms ease;
}

.rg-how.is-animating .rg-how__arrow {
  opacity: 1;
  /* Aparece DEPOIS do fill 3 terminar (3600ms delay + 400ms duration = 4000ms) */
  transition-delay: 4000ms;
  /* Pulso horizontal contínuo: vai-e-vem direita-esquerda, simulando fluxo. */
  animation: rg-arrow-pulse 1500ms cubic-bezier(0.45, 0, 0.55, 1) 4000ms infinite;
}

/* Pulso horizontal da seta no fim do timeline. */
@keyframes rg-arrow-pulse {
  0%, 100% { transform: translateY(-50%) translateX(-6px); }
  50% { transform: translateY(-50%) translateX(6px); }
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

/* Estado inicial dos bullets internos: scale 0 + opacity 0.
   Quando animados, fazem pop (scale 0 → 1.05 → 1) e o fundo
   preenche de verde (já é gradient verde por padrão). */
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
  /* Estado inicial — escondido até o trigger. */
  transform: scale(0);
  opacity: 0;
  transition:
    transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 240ms ease;
}

.rg-how.is-animating .rg-how__bullet--1 .rg-how__bullet-inner {
  transform: scale(1);
  opacity: 1;
  transition-delay: 0ms;
}

.rg-how.is-animating .rg-how__bullet--2 .rg-how__bullet-inner {
  transform: scale(1);
  opacity: 1;
  /* Depois do preenchimento da linha 1 completar */
  transition-delay: 1400ms;
}

.rg-how.is-animating .rg-how__bullet--3 .rg-how__bullet-inner {
  transform: scale(1);
  opacity: 1;
  /* Depois do preenchimento da linha 2 completar */
  transition-delay: 2800ms;
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
  /* Estado inicial: deslocado pra baixo e invisível. Anima pra translateY(0)
     + opacity 1 com transição cubic-bezier suave. */
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 480ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 480ms cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-how.is-animating .rg-how__card--1 {
  opacity: 1;
  transform: translateY(0);
  /* Logo depois do bullet 1 começar (overlap pequeno) */
  transition-delay: 300ms;
}

.rg-how.is-animating .rg-how__card--2 {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 1700ms;
}

.rg-how.is-animating .rg-how__card--3 {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 3100ms;
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

/* prefers-reduced-motion: tudo no estado final, sem animação. O ref
   `isAnimating` já é setado direto pra true no script no caso reduzido,
   mas como reforço, zeramos as transitions aqui. */
@media (prefers-reduced-motion: reduce) {
  .rg-how__bullet-inner,
  .rg-how__card,
  .rg-how__line-fill,
  .rg-how__line-dash,
  .rg-how__check,
  .rg-how__arrow,
  .rg-how__intro-line {
    transition: none !important;
  }
}
</style>
