<script setup lang="ts">
/**
 * Cartão de indicador da fileira do topo do dashboard do admin.
 *
 * A anatomia é a mesma da cabeça do card de prazo — eyebrow, valor e apoio à
 * esquerda, caixa de ícone 36×36 à direita — para os dois blocos pertencerem
 * visivelmente ao mesmo sistema. A caixa em verde-claro é o único toque de cor:
 * o valor fica em neutro, senão a fileira inteira compete com os cards de prazo.
 */
import type { StatusTone } from '@/data/mocks/gestora';

defineProps<{
  eyebrow: string;
  valor: string;
  apoio?: string;
  icone: string;
  chips?: { rotulo: string; tone: Extract<StatusTone, 'success' | 'warning'> }[];
}>();
</script>

<template>
  <section class="gx-kpi">
    <div class="gx-kpi__topo">
      <div class="gx-kpi__textos">
        <h2 class="gx-kpi__eyebrow">{{ eyebrow }}</h2>
        <p class="gx-kpi__valor">{{ valor }}</p>
        <p v-if="apoio" class="gx-kpi__apoio">{{ apoio }}</p>
      </div>

      <span class="gx-kpi__icone" aria-hidden="true">
        <v-icon :icon="icone" size="18" />
      </span>
    </div>

    <ul v-if="chips?.length" class="gx-kpi__chips">
      <li v-for="chip in chips" :key="chip.rotulo" class="gx-kpi__chip" :class="`gx-kpi__chip--${chip.tone}`">
        {{ chip.rotulo }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
/* `height: 100%` porque a fileira é um grid: sem isso um cartão com chip fica mais
   alto que os vizinhos e a linha desalinha. */
.gx-kpi {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  height: 100%;
  padding: var(--rg-space-5);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-raised);
}

.gx-kpi__topo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rg-space-3);
}

.gx-kpi__textos {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  min-width: 0;
}

.gx-kpi__eyebrow {
  margin: 0;
  font-size: var(--rg-font-size-2xs);
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0.06em;
  color: var(--rg-color-text-muted);
}

.gx-kpi__valor {
  margin: 0;
  font-size: var(--rg-font-size-xl);
  line-height: 26px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-kpi__apoio {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.gx-kpi__icone {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
}

.gx-kpi__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rg-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.gx-kpi__chip {
  padding: var(--rg-space-1) 10px;
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-semibold);
}

.gx-kpi__chip--warning {
  background-color: var(--rg-color-feedback-warning-soft);
  color: var(--rg-primitive-amber-700);
}

.gx-kpi__chip--success {
  background-color: var(--rg-color-feedback-success-soft);
  color: var(--rg-color-text-brand);
}
</style>
