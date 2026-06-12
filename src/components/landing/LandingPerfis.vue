<script setup lang="ts">
/**
 * Seção "Perfis do sistema" — os 4 perfis do Decreto 10.255/2023.
 *
 * Três blocos:
 *   1. Seletor de perfil — tablist WAI-ARIA (4 tabs com ícone + tagline,
 *      roving tabindex, setas ←/→/Home/End);
 *   2. Painel de detalhe — troca com <Transition mode="out-in">;
 *   3. Faixa do ciclo de operação — 6 passos conectados (nós que fazem pop
 *      sequencial + conectores que preenchem, mesma linguagem visual do
 *      "Como funciona") + chip de reinício fechando o ciclo. Clicar num nó
 *      ativa o perfil correspondente no painel.
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

// ============ Reveal-on-enter do ciclo ============
const cycleRef = ref<HTMLElement | null>(null);
const cycleVisible = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    cycleVisible.value = true;
    return;
  }
  if (!cycleRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        cycleVisible.value = true;
        observer?.disconnect();
      }
    },
    { threshold: 0.3 },
  );
  observer.observe(cycleRef.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <section id="perfis" class="rg-perfis" aria-labelledby="rg-perfis-title">
    <div class="rg-perfis__inner">
      <!-- Header split: heading à esquerda · lede à direita -->
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
        <p class="rg-perfis__lede">
          O Decreto 10.255/2023 define quem faz o quê na logística reversa de
          Goiás. Cada perfil tem o seu papel — e o ciclo só fecha com os
          quatro juntos.
        </p>
      </header>

      <!-- Seletor de perfil (tablist) -->
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

      <!-- Painel de detalhe do perfil ativo -->
      <div
        id="rg-perfis-panel"
        role="tabpanel"
        :aria-labelledby="`rg-perfis-tab-${active}`"
        class="rg-perfis__panel"
      >
        <Transition name="rg-perfis-swap" mode="out-in">
          <div :key="activeProfile.slug" class="rg-perfis__panel-content">
            <div class="rg-perfis__panel-main">
              <h3 class="rg-perfis__panel-name">{{ activeProfile.name }}</h3>
              <p class="rg-perfis__panel-desc">{{ activeProfile.description }}</p>
              <aside v-if="activeProfile.legalNote" class="rg-perfis__legal">
                <v-icon icon="mdi-scale-balance" size="18" aria-hidden="true" />
                <p>{{ activeProfile.legalNote }}</p>
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

      <!-- Faixa do ciclo de operação -->
      <div
        ref="cycleRef"
        :class="['rg-perfis__cycle-wrap', { 'is-visible': cycleVisible }]"
      >
        <span class="rg-perfis__cycle-eyebrow">O CICLO DE OPERAÇÃO</span>
        <ol class="rg-perfis__cycle" aria-label="Ciclo de operação entre os perfis">
          <li
            v-for="(step, i) in profileCycle"
            :key="`${step.profile}-${i}`"
            class="rg-perfis__cycle-step"
            :style="{ '--rg-step-i': i } as Record<string, string | number>"
          >
            <!-- Conector entre o nó anterior e este (preenche em sequência) -->
            <span v-if="i > 0" class="rg-perfis__cycle-connector" aria-hidden="true" />
            <button
              type="button"
              :class="['rg-perfis__cycle-node', { 'is-active': active === step.profile }]"
              :aria-label="`${step.label} — ver perfil ${nameFor(step.profile)}`"
              @click="setActive(step.profile)"
            >
              <v-icon :icon="iconFor(step.profile)" size="18" />
            </button>
            <span class="rg-perfis__cycle-label">{{ step.label }}</span>
          </li>
          <!-- Fechamento do ciclo: chip de reinício -->
          <li class="rg-perfis__cycle-step rg-perfis__cycle-step--restart" aria-hidden="true">
            <span class="rg-perfis__cycle-connector rg-perfis__cycle-connector--restart" />
            <span class="rg-perfis__cycle-restart">
              <v-icon icon="mdi-recycle-variant" size="18" />
            </span>
            <span class="rg-perfis__cycle-label">e o ciclo recomeça</span>
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

/* ============ Header ============ */
.rg-perfis__header {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1fr);
  align-items: end;
  gap: var(--rg-space-16);
}

.rg-perfis__heading {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
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

.rg-perfis__lede {
  margin: 0;
  max-width: 48ch;
  font-size: var(--rg-font-size-md);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
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
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 6px 18px rgba(15, 23, 42, 0.05);
  transition:
    border-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    transform var(--rg-motion-duration-base) var(--rg-motion-ease-standard),
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.rg-perfis__tab:hover {
  transform: translateY(-2px);
  border-color: var(--rg-primitive-brand-200);
  box-shadow:
    0 2px 4px rgba(15, 23, 42, 0.05),
    0 12px 28px rgba(15, 23, 42, 0.08);
}

.rg-perfis__tab:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.rg-perfis__tab.is-active {
  border-color: var(--rg-primitive-brand-500);
  background-color: var(--rg-primitive-brand-50);
  /* Borda 2px sem mudar layout (mesmo truque do FAQ aberto). */
  box-shadow: inset 0 0 0 1px var(--rg-primitive-brand-500);
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
    background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
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
}

.rg-perfis__panel-content {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: var(--rg-space-12);
  /* Altura mínima cobre o perfil mais alto — a troca não bomba o layout. */
  min-height: 300px;
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

/* Nota legal — borda esquerda âmbar (paleta do badge "Prazo aberto"). */
.rg-perfis__legal {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--rg-space-3);
  align-items: start;
  margin-top: auto;
  padding: var(--rg-space-4) var(--rg-space-5);
  background-color: var(--rg-color-feedback-warning-soft);
  border-left: 3px solid var(--rg-primitive-amber-500);
  border-radius: var(--rg-radius-lg);
}

.rg-perfis__legal :deep(.v-icon) {
  color: var(--rg-primitive-amber-700);
  margin-top: 2px;
}

.rg-perfis__legal p {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  color: var(--rg-color-text-secondary);
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

/* Troca do painel: sai rápido pra cima, entra com ênfase de baixo. */
.rg-perfis-swap-enter-active {
  transition:
    opacity 280ms var(--rg-motion-ease-emphasized),
    transform 280ms var(--rg-motion-ease-emphasized);
}

.rg-perfis-swap-leave-active {
  transition:
    opacity 180ms var(--rg-motion-ease-accelerate),
    transform 180ms var(--rg-motion-ease-accelerate);
}

.rg-perfis-swap-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.rg-perfis-swap-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ============ Ciclo de operação ============ */
.rg-perfis__cycle-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-6);
}

.rg-perfis__cycle-eyebrow {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-bold);
  letter-spacing: var(--rg-letter-spacing-wide);
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
  text-align: center;
}

.rg-perfis__cycle {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  /* 6 passos + chip de reinício. */
  grid-template-columns: repeat(7, 1fr);
  align-items: start;
}

.rg-perfis__cycle-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--rg-space-3);
  padding: 0 var(--rg-space-2);
}

/* Conector: liga o centro do nó anterior ao deste passo. Cada li desenha o
   trecho à sua esquerda — linha na altura do centro do nó (20px). */
.rg-perfis__cycle-connector {
  position: absolute;
  top: 20px;
  /* Vai do centro do passo anterior (-50%) até o centro deste (50%). */
  left: -50%;
  width: 100%;
  height: 2px;
  background-color: var(--rg-primitive-brand-500);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 420ms cubic-bezier(0.65, 0, 0.35, 1);
  /* Preenche depois do pop do nó anterior. */
  transition-delay: calc((var(--rg-step-i, 0) - 1) * 180ms + 240ms);
  border-radius: 1px;
  pointer-events: none;
}

.rg-perfis__cycle-wrap.is-visible .rg-perfis__cycle-connector {
  transform: scaleX(1);
}

.rg-perfis__cycle-node {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
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
  /* Pop sequencial (mesma linguagem dos bullets do Como Funciona). */
  transform: scale(0);
  opacity: 0;
  transition:
    transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 240ms ease,
    box-shadow var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
  transition-delay: calc(var(--rg-step-i, 0) * 180ms);
}

.rg-perfis__cycle-wrap.is-visible .rg-perfis__cycle-node {
  transform: scale(1);
  opacity: 1;
}

/* Hover/active: anel verde claro em volta do nó (delay zerado pra resposta
   imediata depois que a entrada já aconteceu). */
.rg-perfis__cycle-wrap.is-visible .rg-perfis__cycle-node:hover {
  transition-delay: 0ms;
  transform: scale(1.12);
}

.rg-perfis__cycle-node.is-active {
  box-shadow:
    0 5px 12px rgba(31, 131, 68, 0.32),
    0 0 0 4px var(--rg-primitive-brand-100);
}

.rg-perfis__cycle-node:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 3px;
}

.rg-perfis__cycle-restart {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-base);
  border: 2px dashed var(--rg-primitive-brand-400);
  color: var(--rg-primitive-brand-600);
  transform: scale(0);
  opacity: 0;
  transition:
    transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 240ms ease;
  /* Entra por último, junto do conector de retorno. */
  transition-delay: calc(6 * 180ms + 240ms);
}

.rg-perfis__cycle-step--restart {
  /* índice 6 pro delay do conector. */
  --rg-step-i: 6;
}

.rg-perfis__cycle-connector--restart {
  /* Trecho final tracejado — sinaliza o retorno ao início do ciclo. */
  background: none;
  border-top: 2px dashed var(--rg-primitive-brand-400);
  height: 0;
}

.rg-perfis__cycle-wrap.is-visible .rg-perfis__cycle-restart {
  transform: scale(1);
  opacity: 1;
}

.rg-perfis__cycle-label {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  line-height: var(--rg-line-height-snug);
  color: var(--rg-color-text-secondary);
  text-align: center;
  max-width: 16ch;
  /* Fade junto com o pop do nó. */
  opacity: 0;
  transition: opacity 360ms ease;
  transition-delay: calc(var(--rg-step-i, 0) * 180ms + 160ms);
}

.rg-perfis__cycle-wrap.is-visible .rg-perfis__cycle-label {
  opacity: 1;
}

.rg-perfis__cycle-step--restart .rg-perfis__cycle-label {
  font-style: italic;
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
  /* Tablist vira fileira horizontal scrollável com snap. */
  .rg-perfis__selector {
    grid-template-columns: none;
    grid-auto-flow: column;
    grid-auto-columns: minmax(220px, 1fr);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: var(--rg-space-2);
    /* Respiro pro box-shadow dos tabs não cortar. */
    margin-inline: calc(var(--rg-space-1) * -1);
    padding-inline: var(--rg-space-1);
  }
  .rg-perfis__tab {
    scroll-snap-align: start;
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
  /* Ciclo degrada pra timeline vertical — é conteúdo, não some. */
  .rg-perfis__cycle {
    grid-template-columns: 1fr;
    gap: var(--rg-space-2);
    max-width: 420px;
    margin-inline: auto;
    width: 100%;
  }
  .rg-perfis__cycle-step {
    flex-direction: row;
    align-items: center;
    gap: var(--rg-space-4);
    padding: var(--rg-space-2) 0;
  }
  /* Conector vira trecho vertical à esquerda, entre os nós. */
  .rg-perfis__cycle-connector {
    top: -14px;
    left: 19px;
    width: 2px;
    height: 24px;
    transform: scaleY(0);
    transform-origin: top center;
  }
  .rg-perfis__cycle-wrap.is-visible .rg-perfis__cycle-connector {
    transform: scaleY(1);
  }
  .rg-perfis__cycle-label {
    text-align: left;
    max-width: none;
  }
}

@media (max-width: 640px) {
  .rg-perfis {
    padding: var(--rg-space-14) var(--rg-space-4);
  }
  .rg-perfis__panel {
    padding: var(--rg-space-6) var(--rg-space-5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rg-perfis__tab,
  .rg-perfis__tab-icon,
  .rg-perfis__cycle-node,
  .rg-perfis__cycle-connector,
  .rg-perfis__cycle-restart,
  .rg-perfis__cycle-label,
  .rg-perfis-swap-enter-active,
  .rg-perfis-swap-leave-active {
    transition: none !important;
  }
}
</style>
