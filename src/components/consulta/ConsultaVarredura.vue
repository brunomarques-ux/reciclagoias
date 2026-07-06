<script setup lang="ts">
/**
 * Varredura (loading) — a consulta "trabalhando" de verdade.
 *
 * Timeline: as 4 etapas acendem em sequência (pending → active → done),
 * a barra fina preenche em degraus sincronizados e o anel central gira.
 * Quando o CNPJ não existe na base, a varredura é honesta e curta:
 * a etapa 1 conclui e resolve direto (não finge conferir metas de quem
 * não está lá). Com reduced-motion tudo salta em degraus, sem giro.
 *
 * Emite 'done' ao final; o pai decide qual resultado mostrar.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { varreduraSteps, type ConsultaStatus } from '@/data/mocks/consulta';

const props = defineProps<{
  cnpj: string;
  /** Resultado já resolvido pelo pai — define o timing (curto p/ não encontrado). */
  resultado: ConsultaStatus;
}>();

const emit = defineEmits<{ (e: 'done'): void; (e: 'cancel'): void }>();

/** Índice da etapa ativa; etapas < active estão done. */
const active = ref(0);
const finished = ref(false);
const timers: number[] = [];

const encontrado = computed(() => props.resultado !== 'nao-encontrado');

/** Progresso alvo da barra por etapa concluída. */
const progress = computed(() => {
  if (finished.value) return 100;
  if (!encontrado.value) return active.value === 0 ? 18 : 46;
  return [12, 34, 62, 86][active.value] ?? 12;
});

function schedule(fn: () => void, ms: number) {
  timers.push(window.setTimeout(fn, ms));
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const beat = reduced ? 350 : 850;

  if (!encontrado.value) {
    // Curto e honesto: localiza (não acha) e resolve.
    schedule(() => (active.value = 1), beat);
    schedule(() => {
      finished.value = true;
      schedule(() => emit('done'), reduced ? 150 : 450);
    }, beat * 2);
    return;
  }

  // Ciclo completo: 4 etapas encadeadas.
  for (let i = 1; i < varreduraSteps.length; i += 1) {
    schedule(() => (active.value = i), beat * i);
  }
  schedule(() => {
    finished.value = true;
    schedule(() => emit('done'), reduced ? 200 : 550);
  }, beat * varreduraSteps.length);
});

onBeforeUnmount(() => timers.forEach((t) => window.clearTimeout(t)));

function stepState(i: number): 'done' | 'active' | 'pending' {
  if (finished.value) return 'done';
  if (i < active.value) return 'done';
  if (i === active.value) return 'active';
  return 'pending';
}
</script>

<template>
  <div class="cx-scan" role="status" aria-live="polite" :aria-busy="!finished">
    <span class="cx-scan__eyebrow">
      <span class="cx-scan__dot" aria-hidden="true" />
      VERIFICANDO
    </span>

    <div class="cx-scan__card">
      <div :class="['cx-scan__ring', { 'is-finished': finished }]" aria-hidden="true">
        <span class="cx-scan__ring-arc" />
        <v-icon
          :icon="finished ? 'mdi-check-bold' : 'mdi-magnify'"
          size="30"
          class="cx-scan__ring-icon"
        />
      </div>

      <h2 class="cx-scan__title">Consultando a situação da empresa</h2>
      <p class="cx-scan__subtitle">
        Estamos verificando este CNPJ na base do Recicla Goiás. Isso leva algum tempo.
      </p>

      <div class="cx-scan__progress" aria-hidden="true">
        <span class="cx-scan__progress-fill" :style="{ width: `${progress}%` }" />
      </div>

      <span class="cx-scan__cnpj">
        <v-icon icon="mdi-office-building-outline" size="16" aria-hidden="true" />
        <small>CNPJ</small>
        {{ cnpj }}
      </span>

      <hr class="cx-scan__divider" />

      <ol class="cx-scan__steps">
        <li
          v-for="(step, i) in varreduraSteps"
          :key="step.title"
          :class="['cx-scan__step', `is-${stepState(i)}`]"
        >
          <span class="cx-scan__step-ind" aria-hidden="true">
            <v-icon
              v-if="stepState(i) === 'done'"
              icon="mdi-check-bold"
              size="15"
            />
            <v-progress-circular
              v-else-if="stepState(i) === 'active'"
              indeterminate
              size="16"
              width="2"
            />
            <v-icon v-else :icon="step.icon" size="15" />
          </span>
          <span class="cx-scan__step-tx">
            <strong>{{ step.title }}</strong>
            <span>{{ step.helper }}</span>
          </span>
        </li>
      </ol>

      <!-- Anúncio agregado pra leitor de tela (evita 4 live regions) -->
      <span class="cx-visually-hidden">
        Etapa {{ Math.min(active + 1, varreduraSteps.length) }} de {{ varreduraSteps.length }}:
        {{ varreduraSteps[Math.min(active, varreduraSteps.length - 1)]?.title }}
      </span>

      <button type="button" class="cx-scan__cancel" @click="emit('cancel')">
        <v-icon icon="mdi-close" size="18" aria-hidden="true" />
        Cancelar consulta
      </button>
    </div>
  </div>
</template>

<style scoped>
.cx-scan {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: var(--rg-space-10);
}

.cx-scan__eyebrow {
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

.cx-scan__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-600);
  animation: cx-pulse 1.4s ease-in-out infinite;
}

@keyframes cx-pulse {
  50% { opacity: 0.35; }
}

/* ============ Card ============ */
.cx-scan__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(560px, 100%);
  margin-top: var(--rg-space-7);
  padding: var(--rg-space-10);
  border-radius: var(--rg-radius-3xl);
  border: 1px solid var(--rg-color-border-base);
  background-color: var(--rg-color-surface-base);
  box-shadow: var(--rg-elevation-3);
}

/* ============ Anel ============ */
.cx-scan__ring {
  position: relative;
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-50);
  border: 1.5px solid var(--rg-primitive-brand-100);
  color: var(--rg-primitive-brand-600);
  transition: background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.cx-scan__ring-arc {
  position: absolute;
  inset: -7px;
  border-radius: var(--rg-radius-pill);
  border: 3px solid transparent;
  border-top-color: var(--rg-primitive-brand-600);
  animation: cx-spin 1.1s linear infinite;
}

@keyframes cx-spin {
  to { transform: rotate(360deg); }
}

.cx-scan__ring.is-finished {
  background-color: var(--rg-primitive-brand-600);
  color: var(--rg-primitive-neutral-0);
  animation: cx-pop 0.35s var(--rg-motion-ease-emphasized);
}

.cx-scan__ring.is-finished .cx-scan__ring-arc {
  animation: none;
  border-color: var(--rg-primitive-brand-100);
}

@keyframes cx-pop {
  0% { transform: scale(0.85); }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.cx-scan__title {
  margin: var(--rg-space-5) 0 0;
  font-size: var(--rg-font-size-xl);
  font-weight: var(--rg-font-weight-bold);
  text-align: center;
  color: var(--rg-color-text-primary);
}

.cx-scan__subtitle {
  margin: var(--rg-space-3) 0 0;
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-relaxed);
  text-align: center;
  color: var(--rg-color-text-secondary);
}

/* ============ Barra de progresso ============ */
.cx-scan__progress {
  width: 100%;
  height: 6px;
  margin-top: var(--rg-space-5);
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-muted);
  overflow: hidden;
}

.cx-scan__progress-fill {
  display: block;
  height: 100%;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-primitive-brand-500);
  transition: width 0.45s var(--rg-motion-ease-emphasized);
}

/* ============ Chip CNPJ ============ */
.cx-scan__cnpj {
  display: inline-flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin-top: var(--rg-space-5);
  padding: var(--rg-space-2) var(--rg-space-4);
  border-radius: var(--rg-radius-lg);
  border: 1px solid var(--rg-color-border-base);
  background-color: var(--rg-color-surface-soft-tint);
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  font-variant-numeric: tabular-nums;
  color: var(--rg-color-text-primary);
}

.cx-scan__cnpj small {
  font-size: var(--rg-font-size-2xs);
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: var(--rg-letter-spacing-wide);
  color: var(--rg-color-text-secondary);
}

.cx-scan__cnpj .v-icon {
  color: var(--rg-color-text-secondary);
}

.cx-scan__divider {
  width: 100%;
  margin: var(--rg-space-6) 0 var(--rg-space-4);
  border: none;
  border-top: 1px solid var(--rg-color-surface-muted);
}

/* ============ Etapas ============ */
.cx-scan__steps {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
}

.cx-scan__step {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-3);
  padding: var(--rg-space-3) var(--rg-space-2);
  border-radius: var(--rg-radius-lg);
  transition: background-color var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}

.cx-scan__step.is-active {
  background-color: var(--rg-primitive-brand-50);
}

.cx-scan__step-ind {
  display: grid;
  place-items: center;
  flex: none;
  width: 28px;
  height: 28px;
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-surface-muted);
  color: var(--rg-color-text-tertiary);
  transition:
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-scan__step.is-active .cx-scan__step-ind {
  background-color: var(--rg-color-surface-base);
  border: 2px solid var(--rg-primitive-brand-600);
  color: var(--rg-primitive-brand-600);
}

.cx-scan__step.is-done .cx-scan__step-ind {
  background-color: var(--rg-primitive-brand-600);
  color: var(--rg-primitive-neutral-0);
  animation: cx-pop 0.3s var(--rg-motion-ease-emphasized);
}

.cx-scan__step-tx {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cx-scan__step-tx strong {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-tertiary);
  transition: color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-scan__step-tx span {
  font-size: var(--rg-font-size-xs);
  line-height: var(--rg-line-height-base);
  color: var(--rg-color-text-tertiary);
  transition: color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-scan__step.is-active .cx-scan__step-tx strong {
  color: var(--rg-color-text-primary);
}

.cx-scan__step.is-active .cx-scan__step-tx span,
.cx-scan__step.is-done .cx-scan__step-tx span {
  color: var(--rg-color-text-secondary);
}

.cx-scan__step.is-done .cx-scan__step-tx strong {
  color: var(--rg-color-text-primary);
}

/* ============ Cancelar ============ */
.cx-scan__cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-2);
  width: 100%;
  height: 48px;
  margin-top: var(--rg-space-6);
  border: 1.5px solid var(--rg-primitive-brand-600);
  border-radius: var(--rg-radius-lg);
  background: transparent;
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-primitive-brand-700);
  cursor: pointer;
  transition: background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.cx-scan__cancel:hover {
  background-color: var(--rg-primitive-brand-50);
}

.cx-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .cx-scan__card {
    padding: var(--rg-space-6);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cx-scan__dot,
  .cx-scan__ring-arc {
    animation: none !important;
  }
  .cx-scan__ring.is-finished,
  .cx-scan__step.is-done .cx-scan__step-ind {
    animation: none !important;
  }
  .cx-scan__progress-fill {
    transition: none !important;
  }
}
</style>
