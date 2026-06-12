<script setup lang="ts">
/**
 * Seção "Perfis do sistema" — espelho do component set "Seção Perfis do
 * Sistema" do Figma (SisRev - Rascunho · Componentes · Recicla Goiás).
 *
 * Blocos:
 *   1. Header split — heading à esquerda; lede à direita alinhada à direita
 *      com fio verde embaixo (mesma linguagem do intro do Como Funciona),
 *      ambos alinhados pela base.
 *   2. Seletor de perfil — tablist WAI-ARIA; tabs entram progressivamente
 *      (Empresa já ativa) e a ativa pulsa (anel suave, padrão do CTA do
 *      disclaimer). Troca de estado com fade (transition de cores).
 *   3. Painel — troca com fade puro (out-in); badge de destaque por perfil
 *      (texto + quadrado tonal 44px com ícone — âmbar = legal, verde =
 *      processo).
 *   4. Ciclo de operação — pista oval fechada (racetrack) com 6 nós
 *      numerados, setas de direção, selo central e um PULSO de energia
 *      contínuo que percorre a pista (offset-path) acendendo cada nó ao
 *      passar. Desktop usa a pista (escalada pra caber); mobile degrada
 *      pra timeline vertical com o mesmo blink sequencial.
 *
 * Animações de entrada (IntersectionObserver → .is-visible):
 *   heading fade + desliza da esquerda; lede fade + desliza da direita;
 *   tabs surgem em sequência; pista se desenha (stroke-dash) e os nós dão
 *   pop; então o pulso começa.
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import {
  systemProfiles,
  profileCycle,
  type ProfileSlug,
} from '@/data/mocks/landing';

// ============ Seletor (tablist) ============
const active = ref<ProfileSlug>('empresa');

const activeProfile = computed(
  () => systemProfiles.find((p) => p.slug === active.value) ?? systemProfiles[0]!,
);

const tabRefs = ref<(HTMLButtonElement | null)[]>([]);

function setActive(slug: ProfileSlug) {
  active.value = slug;
}

/** Navegação por setas no tablist (padrão WAI-ARIA Tabs, roving tabindex). */
function onTabKeydown(ev: KeyboardEvent, index: number) {
  const count = systemProfiles.length;
  let next: number | null = null;
  if (ev.key === 'ArrowRight') next = (index + 1) % count;
  else if (ev.key === 'ArrowLeft') next = (index - 1 + count) % count;
  else if (ev.key === 'Home') next = 0;
  else if (ev.key === 'End') next = count - 1;
  if (next === null) return;
  ev.preventDefault();
  const profile = systemProfiles[next];
  if (!profile) return;
  active.value = profile.slug;
  tabRefs.value[next]?.focus();
}

function iconFor(slug: ProfileSlug): string {
  return systemProfiles.find((p) => p.slug === slug)?.icon ?? 'mdi-account-outline';
}

function nameFor(slug: ProfileSlug): string {
  return systemProfiles.find((p) => p.slug === slug)?.name ?? slug;
}

// ============ Geometria da pista (design fixo 1200×396, do Figma) ============
// Pista: rounded-rect x:120 y:88 w:960 h:224 r:112 → laterais são
// semicírculos perfeitos (r = h/2). Path começa no nó 1 e roda em sentido
// horário — o MESMO path alimenta o desenho do traço e o offset-path do pulso.
const TRACK_PATH =
  'M 331 88 H 968 A 112 112 0 0 1 968 312 H 232 A 112 112 0 0 1 232 88 H 331';
// Perímetro: 2×736 (retas) + 2π×112 (semicírculos) ≈ 2176 — usado no CSS
// (stroke-dasharray do desenho da pista).
/** Duração de uma volta completa do pulso. */
const PULSE_SECONDS = 12;
/** Atraso até o pulso começar (espera o desenho da pista + pops). */
const PULSE_START = 1.6;

/** Posição de cada nó na pista + fração do perímetro até ele (pra sincronizar
 *  o blink do nó com a passagem do pulso). Frações derivadas da geometria:
 *  retas de 736px valem ~0.3382 do perímetro cada; semicírculos ~0.1617. */
const NODE_GEO = [
  { x: 331, y: 88, top: true, frac: 0 },
  { x: 600, y: 88, top: true, frac: 0.1236 },
  { x: 869, y: 88, top: true, frac: 0.2473 },
  { x: 869, y: 312, top: false, frac: 0.5 },
  { x: 600, y: 312, top: false, frac: 0.6236 },
  { x: 331, y: 312, top: false, frac: 0.7473 },
];

const cycleSteps = computed(() =>
  profileCycle.map((step, i) => ({
    ...step,
    geo: NODE_GEO[i]!,
    blinkDelay: `${(PULSE_START + NODE_GEO[i]!.frac * PULSE_SECONDS).toFixed(2)}s`,
  })),
);

/** Setas de direção embutidas na pista (sentido horário). */
const TRACK_ARROWS = [
  { x: 465, y: 88, rot: 0 },
  { x: 734, y: 88, rot: 0 },
  { x: 1080, y: 200, rot: 90 },
  { x: 734, y: 312, rot: 180 },
  { x: 465, y: 312, rot: 180 },
  { x: 120, y: 200, rot: 270 },
];

// ============ Escala da pista pro container ============
// O loop tem design fixo de 1200px; abaixo disso escala via transform
// (offset-path não aceita percentuais — geometria precisa ser absoluta).
const loopOuterRef = ref<HTMLElement | null>(null);
const loopScale = ref(1);
let resizeObserver: ResizeObserver | null = null;

function updateScale() {
  const el = loopOuterRef.value;
  if (!el) return;
  loopScale.value = Math.min(1, el.clientWidth / 1200);
}

// ============ Entrada (reveal-on-enter) ============
const sectionRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  updateScale();
  resizeObserver = new ResizeObserver(updateScale);
  if (loopOuterRef.value) resizeObserver.observe(loopOuterRef.value);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    isVisible.value = true;
    return;
  }
  if (!sectionRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        isVisible.value = true;
        observer?.disconnect();
      }
    },
    { threshold: 0.2 },
  );
  observer.observe(sectionRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  resizeObserver?.disconnect();
});
</script>

<template>
  <section
    id="perfis"
    ref="sectionRef"
    :class="['rg-perfis', { 'is-visible': isVisible }]"
    aria-labelledby="rg-perfis-title"
  >
    <div class="rg-perfis__inner">
      <!-- Header split: heading à esquerda · lede + fio à direita, base alinhada -->
      <header class="rg-perfis__header">
        <div class="rg-perfis__heading">
          <span class="rg-perfis__eyebrow">QUEM PARTICIPA</span>
          <h2 id="rg-perfis-title" class="rg-perfis__title">
            <span class="rg-perfis__title-line">Um sistema,</span>
            <span class="rg-perfis__title-line">
              quatro <span class="rg-perfis__title-accent">perfis.</span>
            </span>
          </h2>
        </div>
        <div class="rg-perfis__lede-wrap">
          <p class="rg-perfis__lede">
            O Decreto 10.255/2023 define quem faz o quê na logística reversa
            de Goiás. Cada perfil tem o seu papel, e o ciclo só fecha com os
            quatro juntos.
          </p>
          <span class="rg-perfis__lede-rule" aria-hidden="true" />
        </div>
      </header>

      <!-- Seletor de perfil (tablist) — tabs entram em sequência -->
      <div
        class="rg-perfis__selector"
        role="tablist"
        aria-label="Perfis do sistema"
      >
        <button
          v-for="(p, i) in systemProfiles"
          :id="`rg-perfis-tab-${p.slug}`"
          :key="p.slug"
          :ref="(el) => { tabRefs[i] = el as HTMLButtonElement | null; }"
          type="button"
          role="tab"
          :aria-selected="active === p.slug"
          aria-controls="rg-perfis-panel"
          :tabindex="active === p.slug ? 0 : -1"
          :class="['rg-perfis__tab', { 'is-active': active === p.slug }]"
          :style="{ '--rg-tab-i': i } as Record<string, string | number>"
          @click="setActive(p.slug)"
          @keydown="onTabKeydown($event, i)"
        >
          <span class="rg-perfis__tab-icon" aria-hidden="true">
            <v-icon :icon="p.icon" size="26" />
          </span>
          <span class="rg-perfis__tab-text">
            <strong class="rg-perfis__tab-label">{{ p.shortLabel }}</strong>
            <span class="rg-perfis__tab-tagline">{{ p.tagline }}</span>
          </span>
        </button>
      </div>

      <!-- Painel de detalhe do perfil ativo — troca com fade -->
      <div
        id="rg-perfis-panel"
        role="tabpanel"
        :aria-labelledby="`rg-perfis-tab-${active}`"
        class="rg-perfis__panel"
      >
        <Transition name="rg-perfis-fade" mode="out-in">
          <div :key="activeProfile.slug" class="rg-perfis__panel-content">
            <div class="rg-perfis__panel-main">
              <h3 class="rg-perfis__panel-name">{{ activeProfile.name }}</h3>
              <p class="rg-perfis__panel-desc">{{ activeProfile.description }}</p>
              <aside
                class="rg-perfis__badge"
                :data-tone="activeProfile.badge.tone"
              >
                <p class="rg-perfis__badge-text">{{ activeProfile.badge.text }}</p>
                <span class="rg-perfis__badge-icon" aria-hidden="true">
                  <v-icon :icon="activeProfile.badge.icon" size="22" />
                </span>
              </aside>
            </div>
            <div class="rg-perfis__panel-side">
              <span class="rg-perfis__resp-label">O QUE FAZ NO SISTEMA</span>
              <ul class="rg-perfis__resp-list" role="list">
                <li
                  v-for="r in activeProfile.responsibilities"
                  :key="r"
                  class="rg-perfis__resp-item"
                >
                  <span class="rg-perfis__resp-check" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="12" height="12">
                      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" fill="currentColor"/>
                    </svg>
                  </span>
                  {{ r }}
                </li>
              </ul>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Ciclo de operação — pista oval com pulso contínuo (desktop) -->
      <div class="rg-perfis__cycle-wrap">
        <span class="rg-perfis__cycle-eyebrow">O CICLO DE OPERAÇÃO</span>

        <div ref="loopOuterRef" class="rg-perfis__loop-outer" :style="{ height: `${396 * loopScale}px` }">
          <div
            class="rg-perfis__loop"
            :style="{ transform: `scale(${loopScale})` } as Record<string, string>"
            role="list"
            aria-label="Ciclo de operação entre os perfis"
          >
            <!-- Pista (desenha na entrada; mesmo path do offset do pulso) -->
            <svg class="rg-perfis__track" viewBox="0 0 1200 396" aria-hidden="true">
              <path class="rg-perfis__track-path" :d="TRACK_PATH" />
            </svg>

            <!-- Pulso de energia que percorre a pista infinitamente -->
            <span class="rg-perfis__pulse" aria-hidden="true" />

            <!-- Setas de direção (sentido horário) -->
            <span
              v-for="(a, i) in TRACK_ARROWS"
              :key="`arrow-${i}`"
              class="rg-perfis__arrow"
              :style="{ left: `${a.x}px`, top: `${a.y}px`, '--rg-arrow-rot': `${a.rot}deg` } as Record<string, string>"
              aria-hidden="true"
            >
              <v-icon icon="mdi-chevron-right" size="16" />
            </span>

            <!-- Nós numerados + rótulos -->
            <template v-for="(step, i) in cycleSteps" :key="`step-${i}`">
              <button
                type="button"
                role="listitem"
                :class="['rg-perfis__node', { 'is-active': active === step.profile }]"
                :style="{
                  left: `${step.geo.x - 22}px`,
                  top: `${step.geo.y - 22}px`,
                  '--rg-node-i': i,
                  '--rg-blink-delay': step.blinkDelay,
                } as Record<string, string | number>"
                :aria-label="`${step.label} — ver perfil ${nameFor(step.profile)}`"
                @click="setActive(step.profile)"
              >
                <v-icon :icon="iconFor(step.profile)" size="22" />
              </button>
              <span
                class="rg-perfis__num"
                :style="{ left: `${step.geo.x + 8}px`, top: `${step.geo.y - 26}px`, '--rg-node-i': i } as Record<string, string | number>"
                aria-hidden="true"
              >{{ i + 1 }}</span>
              <span
                class="rg-perfis__node-label"
                :style="{
                  left: `${step.geo.x - 105}px`,
                  top: step.geo.top ? `${step.geo.y - 80}px` : `${step.geo.y + 34}px`,
                  '--rg-node-i': i,
                } as Record<string, string | number>"
              >{{ step.label }}</span>
            </template>

            <!-- Selo central -->
            <span class="rg-perfis__seal" aria-hidden="true">
              <v-icon icon="mdi-recycle-variant" size="30" />
            </span>
            <span class="rg-perfis__seal-caption" aria-hidden="true">CICLO CONTÍNUO</span>
          </div>
        </div>

        <!-- Timeline vertical (mobile) — mesmo blink sequencial, sem pista -->
        <ol class="rg-perfis__cycle-mobile" aria-label="Ciclo de operação entre os perfis">
          <li
            v-for="(step, i) in cycleSteps"
            :key="`m-${i}`"
            class="rg-perfis__m-step"
          >
            <span v-if="i > 0" class="rg-perfis__m-conn" aria-hidden="true" />
            <button
              type="button"
              :class="['rg-perfis__node', 'rg-perfis__node--m', { 'is-active': active === step.profile }]"
              :style="{ '--rg-node-i': i, '--rg-blink-delay': step.blinkDelay } as Record<string, string | number>"
              :aria-label="`${step.label} — ver perfil ${nameFor(step.profile)}`"
              @click="setActive(step.profile)"
            >
              <v-icon :icon="iconFor(step.profile)" size="20" />
              <span class="rg-perfis__num rg-perfis__num--m" aria-hidden="true">{{ i + 1 }}</span>
            </button>
            <span class="rg-perfis__m-label">{{ step.label }}</span>
          </li>
          <li class="rg-perfis__m-step rg-perfis__m-step--seal" aria-hidden="true">
            <span class="rg-perfis__m-conn" />
            <span class="rg-perfis__seal rg-perfis__seal--m">
              <v-icon icon="mdi-recycle-variant" size="20" />
            </span>
            <span class="rg-perfis__m-label rg-perfis__m-label--seal">CICLO CONTÍNUO</span>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rg-perfis {
  position: relative;
  /* Padding vertical 96px — 16px a mais pra respiro entre seções. */
  padding: var(--rg-space-24) var(--rg-space-6);
  background-color: var(--rg-color-surface-soft-tint);
}

.rg-perfis__inner {
  max-width: var(--rg-container-page);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-10);
}

/* ============ Header (split, base alinhada — Figma) ============ */
.rg-perfis__header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  justify-content: space-between;
  /* Base do título alinhada com a base do bloco lede+fio. */
  align-items: end;
  gap: var(--rg-space-16);
}

.rg-perfis__heading {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  /* Entrada: desliza da esquerda pra direita com fade (junto do eyebrow). */
  opacity: 0;
  transform: translateX(-24px);
  transition:
    opacity 700ms var(--rg-motion-ease-standard),
    transform 700ms var(--rg-motion-ease-standard);
}

.rg-perfis.is-visible .rg-perfis__heading {
  opacity: 1;
  transform: translateX(0);
}

.rg-perfis__eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-brand);
}

.rg-perfis__title {
  margin: 0;
  display: flex;
  flex-direction: column;
  font-size: 56px;
  line-height: 1.05;
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.rg-perfis__title-line {
  display: block;
}

.rg-perfis__title-accent {
  color: var(--rg-primitive-brand-500);
}

/* Bloco lede: texto alinhado à direita + fio verde embaixo (mesma linguagem
   do intro do Como Funciona). Entrada: desliza da direita pra esquerda. */
.rg-perfis__lede-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--rg-space-6);
  opacity: 0;
  transform: translateX(24px);
  transition:
    opacity 700ms var(--rg-motion-ease-standard) 100ms,
    transform 700ms var(--rg-motion-ease-standard) 100ms;
}

.rg-perfis.is-visible .rg-perfis__lede-wrap {
  opacity: 1;
  transform: translateX(0);
}

.rg-perfis__lede {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
  text-align: right;
}

.rg-perfis__lede-rule {
  display: block;
  width: 16px;
  height: 4.5px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-action-primary);
}

/* ============ Seletor (tablist) ============ */
.rg-perfis__selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--rg-space-3);
}

.rg-perfis__tab {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-3);
  align-items: center;
  padding: var(--rg-space-4) var(--rg-space-5);
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-xl);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  /* Estados trocam com FADE (cores transicionam) — pedido do design. */
  transition:
    border-color 300ms var(--rg-motion-ease-standard),
    background-color 300ms var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow 300ms var(--rg-motion-ease-standard),
    opacity 600ms var(--rg-motion-ease-standard);
  /* Entrada progressiva: cada tab surge em sequência (Empresa primeiro,
     já marcada; depois Gestora, Operador e Verificador). */
  opacity: 0;
  transform: translateY(10px);
  transition-delay: 0ms, 0ms, 0ms, 0ms, calc(280ms + var(--rg-tab-i, 0) * 160ms);
}

.rg-perfis.is-visible .rg-perfis__tab {
  opacity: 1;
  transform: translateY(0);
}

/* Depois da entrada, hover/clique respondem sem o delay da entrada. */
.rg-perfis.is-visible .rg-perfis__tab:hover {
  transition-delay: 0ms;
  transform: translateY(-2px);
  border-color: var(--rg-primitive-brand-200);
}

.rg-perfis__tab:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.rg-perfis__tab.is-active {
  border-color: var(--rg-primitive-brand-500);
  background-color: var(--rg-primitive-brand-50);
  /* Anel "neon" suave pulsando em volta da tab ativa — mesmo padrão do CTA
     destacado do disclaimer (expande e esvai). O inset mantém a borda 2px. */
  animation: rg-perfis-tab-pulse 2.4s ease-in-out infinite;
}

@keyframes rg-perfis-tab-pulse {
  0% {
    box-shadow:
      inset 0 0 0 1px var(--rg-primitive-brand-500),
      0 0 0 0 rgba(39, 156, 80, 0.35);
  }
  70% {
    box-shadow:
      inset 0 0 0 1px var(--rg-primitive-brand-500),
      0 0 0 10px rgba(39, 156, 80, 0);
  }
  100% {
    box-shadow:
      inset 0 0 0 1px var(--rg-primitive-brand-500),
      0 0 0 0 rgba(39, 156, 80, 0);
  }
}

.rg-perfis__tab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-primitive-brand-50);
  border: 1px solid var(--rg-primitive-brand-200);
  color: var(--rg-primitive-brand-700);
  flex: none;
  transition:
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    background-color 300ms var(--rg-motion-ease-standard);
}

.rg-perfis__tab.is-active .rg-perfis__tab-icon {
  transform: scale(1.06);
  background-color: var(--rg-primitive-brand-100);
}

.rg-perfis__tab-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rg-perfis__tab-label {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-bold);
  color: var(--rg-color-text-primary);
}

.rg-perfis__tab-tagline {
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
  line-height: var(--rg-line-height-snug);
}

/* ============ Painel ============ */
.rg-perfis__panel {
  background-color: var(--rg-color-surface-base);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-2xl);
  padding: var(--rg-space-10);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 32px rgba(15, 23, 42, 0.06);
  /* Painel entra junto com a primeira tab (Empresa). */
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 600ms var(--rg-motion-ease-standard) 360ms,
    transform 600ms var(--rg-motion-ease-standard) 360ms;
}

.rg-perfis.is-visible .rg-perfis__panel {
  opacity: 1;
  transform: translateY(0);
}

.rg-perfis__panel-content {
  display: grid;
  /* Main flexível + Side fixa em 400px (proporção do Figma). */
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: var(--rg-space-12);
  /* Altura mínima cobre o perfil mais alto — a troca não bomba o layout. */
  min-height: 280px;
}

.rg-perfis__panel-main {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
}

.rg-perfis__panel-name {
  margin: 0;
  font-size: var(--rg-font-size-3xl);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-tight);
  color: var(--rg-color-text-primary);
}

.rg-perfis__panel-desc {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

/* Badge de destaque — texto à esquerda + quadrado tonal 44px com ícone à
   direita (padrão do Figma). Tom por semântica: âmbar = restrição/prazo
   legal; verde = integridade de processo. */
.rg-perfis__badge {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--rg-space-3);
  align-items: center;
  margin-top: auto;
  padding: var(--rg-space-4) var(--rg-space-5);
  border-radius: var(--rg-radius-lg);
  border-left: 3px solid transparent;
}

.rg-perfis__badge[data-tone='amber'] {
  background-color: #fdf6e7;
  border-left-color: var(--rg-primitive-amber-500);
}

.rg-perfis__badge[data-tone='green'] {
  background-color: var(--rg-primitive-brand-50);
  border-left-color: var(--rg-primitive-brand-500);
}

.rg-perfis__badge-text {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-perfis__badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--rg-radius-md);
  flex: none;
}

.rg-perfis__badge[data-tone='amber'] .rg-perfis__badge-icon {
  background-color: #faebc9;
  color: var(--rg-primitive-amber-700);
}

.rg-perfis__badge[data-tone='green'] .rg-perfis__badge-icon {
  background-color: var(--rg-primitive-brand-100);
  color: var(--rg-primitive-brand-700);
}

.rg-perfis__panel-side {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
}

.rg-perfis__resp-label {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-primitive-brand-700);
}

.rg-perfis__resp-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.rg-perfis__resp-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-3);
  align-items: start;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
}

.rg-perfis__resp-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  background-color: var(--rg-primitive-brand-50);
  border: 2px solid var(--rg-color-action-primary);
  border-radius: var(--rg-radius-pill);
  color: var(--rg-color-action-primary);
  flex: none;
}

/* Troca do painel: FADE puro (pedido do design). */
.rg-perfis-fade-enter-active {
  transition: opacity 240ms var(--rg-motion-ease-standard);
}

.rg-perfis-fade-leave-active {
  transition: opacity 160ms var(--rg-motion-ease-accelerate);
}

.rg-perfis-fade-enter-from,
.rg-perfis-fade-leave-to {
  opacity: 0;
}

/* ============ Ciclo de operação — pista (desktop) ============ */
.rg-perfis__cycle-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-6);
  align-items: center;
}

.rg-perfis__cycle-eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
  text-align: center;
}

.rg-perfis__loop-outer {
  width: 100%;
  /* Altura definida via style inline (396 × escala). */
}

.rg-perfis__loop {
  position: relative;
  width: 1200px;
  height: 396px;
  transform-origin: top left;
}

.rg-perfis__track {
  position: absolute;
  inset: 0;
  width: 1200px;
  height: 396px;
  pointer-events: none;
}

/* A pista "se desenha" na entrada (stroke-dash do perímetro até zero). */
.rg-perfis__track-path {
  fill: none;
  stroke: var(--rg-primitive-brand-200);
  stroke-width: 2;
  stroke-dasharray: 2176;
  stroke-dashoffset: 2176;
}

.rg-perfis.is-visible .rg-perfis__track-path {
  animation: rg-perfis-track-draw 1.1s var(--rg-motion-ease-emphasized) 0.25s forwards;
}

@keyframes rg-perfis-track-draw {
  to { stroke-dashoffset: 0; }
}

/* Pulso de energia: ponto brilhante que percorre o MESMO path da pista em
   loop infinito — a cada passagem por um nó, o nó pisca (blink sincronizado
   por delay). O movimento contínuo materializa o "ciclo contínuo". */
.rg-perfis__pulse {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-500);
  box-shadow:
    0 0 6px 2px rgba(39, 156, 80, 0.55),
    0 0 16px 6px rgba(39, 156, 80, 0.25);
  offset-path: path('M 331 88 H 968 A 112 112 0 0 1 968 312 H 232 A 112 112 0 0 1 232 88 H 331');
  offset-rotate: 0deg;
  opacity: 0;
}

.rg-perfis.is-visible .rg-perfis__pulse {
  animation: rg-perfis-pulse-travel 12s linear 1.6s infinite;
}

@keyframes rg-perfis-pulse-travel {
  0% {
    offset-distance: 0%;
    opacity: 0;
  }
  2% {
    opacity: 1;
  }
  98% {
    opacity: 1;
  }
  100% {
    offset-distance: 100%;
    opacity: 0;
  }
}

/* Setas de direção sobre a pista (com "respiro" no fundo da seção). */
.rg-perfis__arrow {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-soft-tint);
  color: var(--rg-primitive-brand-500);
  transform: translate(-50%, -50%) rotate(var(--rg-arrow-rot, 0deg));
  opacity: 0;
  transition: opacity 500ms ease 1.2s;
  pointer-events: none;
}

.rg-perfis.is-visible .rg-perfis__arrow {
  opacity: 1;
}

/* Nós sobre a pista — pop de entrada em sequência + blink quando o pulso
   passa + anel persistente no perfil ativo. */
.rg-perfis__node {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: var(--rg-radius-pill);
  background-image: linear-gradient(
    135deg,
    var(--rg-primitive-brand-400) 0%,
    var(--rg-primitive-brand-600) 50%,
    var(--rg-primitive-brand-800) 100%
  );
  color: white;
  cursor: pointer;
  box-shadow:
    0 5px 12px rgba(31, 131, 68, 0.32),
    0 0 0 0.5px rgba(255, 255, 255, 0.1) inset;
  transform: scale(0);
  opacity: 0;
  transition:
    transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1) calc(450ms + var(--rg-node-i, 0) * 120ms),
    opacity 240ms ease calc(450ms + var(--rg-node-i, 0) * 120ms),
    box-shadow 300ms var(--rg-motion-ease-standard);
}

.rg-perfis.is-visible .rg-perfis__node {
  transform: scale(1);
  opacity: 1;
}

.rg-perfis.is-visible .rg-perfis__node:hover {
  transition-delay: 0ms;
  transform: scale(1.12);
}

.rg-perfis__node.is-active {
  box-shadow:
    0 5px 12px rgba(31, 131, 68, 0.32),
    0 0 0 4px var(--rg-primitive-brand-100);
}

.rg-perfis__node:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 3px;
}

/* Blink do nó na passagem do pulso: um anel se expande e esvai, partindo do
   instante em que o pulso alcança a fração do perímetro daquele nó. */
.rg-perfis__node::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  border: 2px solid var(--rg-primitive-brand-400);
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
}

.rg-perfis.is-visible .rg-perfis__node::after {
  animation: rg-perfis-node-blink 12s linear var(--rg-blink-delay, 1.6s) infinite;
}

@keyframes rg-perfis-node-blink {
  0% {
    opacity: 0.9;
    transform: scale(0.8);
  }
  3% {
    opacity: 0.4;
    transform: scale(1.7);
  }
  5%, 100% {
    opacity: 0;
    transform: scale(1.9);
  }
}

/* Badge numerado do nó. */
.rg-perfis__num {
  position: absolute;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-text-primary);
  border: 2px solid var(--rg-color-surface-soft-tint);
  color: white;
  font-size: 10px;
  font-weight: var(--rg-font-weight-bold);
  opacity: 0;
  transition: opacity 300ms ease calc(550ms + var(--rg-node-i, 0) * 120ms);
  pointer-events: none;
}

.rg-perfis.is-visible .rg-perfis__num {
  opacity: 1;
}

.rg-perfis__node-label {
  position: absolute;
  width: 210px;
  font-size: 12.5px;
  font-weight: var(--rg-font-weight-medium);
  line-height: 17px;
  color: var(--rg-primitive-neutral-700);
  text-align: center;
  opacity: 0;
  transition: opacity 360ms ease calc(600ms + var(--rg-node-i, 0) * 120ms);
}

.rg-perfis.is-visible .rg-perfis__node-label {
  opacity: 1;
}

/* Selo central + legenda. */
.rg-perfis__seal {
  position: absolute;
  left: 568px;
  top: 160px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  border: 1.5px solid var(--rg-primitive-brand-100);
  color: var(--rg-primitive-brand-600);
  transform: scale(0);
  opacity: 0;
  transition:
    transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 1.25s,
    opacity 240ms ease 1.25s;
}

.rg-perfis.is-visible .rg-perfis__seal {
  transform: scale(1);
  opacity: 1;
}

.rg-perfis__seal-caption {
  position: absolute;
  left: 500px;
  top: 234px;
  width: 200px;
  font-size: 11px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-eyebrow);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
  text-align: center;
  opacity: 0;
  transition: opacity 360ms ease 1.4s;
}

.rg-perfis.is-visible .rg-perfis__seal-caption {
  opacity: 1;
}

/* ============ Ciclo mobile (timeline vertical) ============ */
.rg-perfis__cycle-mobile {
  display: none;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-direction: column;
  width: fit-content;
  max-width: 100%;
  margin-inline: auto;
}

.rg-perfis__m-step {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
  padding: var(--rg-space-2) 0;
}

.rg-perfis__m-conn {
  position: absolute;
  top: -14px;
  left: 21px;
  width: 2px;
  height: 26px;
  background-color: var(--rg-primitive-brand-300);
}

.rg-perfis__node--m {
  position: relative;
  left: auto;
  top: auto;
  width: 44px;
  height: 44px;
  transform: scale(1);
  opacity: 1;
  transition: box-shadow 300ms var(--rg-motion-ease-standard);
}

.rg-perfis__num--m {
  left: auto;
  top: -4px;
  right: -4px;
  opacity: 1;
  transition: none;
}

.rg-perfis__m-label {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  line-height: var(--rg-line-height-snug);
  color: var(--rg-primitive-neutral-700);
}

.rg-perfis__seal--m {
  position: relative;
  left: auto;
  top: auto;
  width: 44px;
  height: 44px;
  transform: scale(1);
  opacity: 1;
  transition: none;
}

.rg-perfis__m-label--seal {
  font-size: 11px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}

/* ============ Responsivo ============ */
@media (max-width: 960px) {
  .rg-perfis__header {
    grid-template-columns: 1fr;
    align-items: start;
    gap: var(--rg-space-4);
  }
  .rg-perfis__title {
    font-size: clamp(32px, 6vw, 44px);
  }
  /* Lede volta pra esquerda no empilhado (fio acompanha). */
  .rg-perfis__lede-wrap {
    align-items: flex-start;
  }
  .rg-perfis__lede {
    text-align: left;
  }
  .rg-perfis__selector {
    grid-template-columns: repeat(2, 1fr);
  }
  .rg-perfis__panel {
    padding: var(--rg-space-8);
  }
  .rg-perfis__panel-content {
    grid-template-columns: 1fr;
    gap: var(--rg-space-8);
    min-height: 0;
  }
}

@media (max-width: 768px) {
  /* Pista sai; timeline vertical entra (conteúdo preservado). */
  .rg-perfis__loop-outer {
    display: none;
  }
  .rg-perfis__cycle-mobile {
    display: flex;
  }
}

@media (max-width: 640px) {
  .rg-perfis {
    padding: var(--rg-space-14) var(--rg-space-4);
  }
  .rg-perfis__panel {
    padding: var(--rg-space-6) var(--rg-space-5);
  }
  /* Tab compacta na grade 2×2: ícone em cima, só o nome. */
  .rg-perfis__tab {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
    gap: var(--rg-space-2);
    padding: var(--rg-space-4) var(--rg-space-3);
  }
  .rg-perfis__tab-icon {
    width: 44px;
    height: 44px;
  }
  .rg-perfis__tab-text {
    align-items: center;
  }
  .rg-perfis__tab-tagline {
    display: none;
  }
}

/* ============ Reduced motion: estado final, sem pulso ============ */
@media (prefers-reduced-motion: reduce) {
  .rg-perfis__heading,
  .rg-perfis__lede-wrap,
  .rg-perfis__tab,
  .rg-perfis__tab-icon,
  .rg-perfis__panel,
  .rg-perfis__node,
  .rg-perfis__num,
  .rg-perfis__node-label,
  .rg-perfis__arrow,
  .rg-perfis__seal,
  .rg-perfis__seal-caption,
  .rg-perfis-fade-enter-active,
  .rg-perfis-fade-leave-active {
    transition: none !important;
    animation: none !important;
  }
  .rg-perfis__tab.is-active {
    animation: none !important;
    box-shadow: inset 0 0 0 1px var(--rg-primitive-brand-500);
  }
  .rg-perfis__track-path {
    stroke-dashoffset: 0;
    animation: none !important;
  }
  .rg-perfis__pulse,
  .rg-perfis__node::after {
    display: none !important;
  }
}
</style>
