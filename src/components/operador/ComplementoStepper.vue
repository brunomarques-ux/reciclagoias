<script setup lang="ts">
/**
 * Stepper do complemento — os 5 passos com bolinha de 28, check no concluído e
 * traço entre passos, réplica do `StepperStep` da biblioteca no Figma.
 *
 * No protótipo qualquer passo é clicável (facilita a demonstração); no sistema
 * real a regra de bloqueio de avanço é da store, não daqui.
 */
import { ETAPAS } from '@/data/mocks/operador';

defineProps<{ atual: number }>();
const emit = defineEmits<{ (e: 'ir', etapa: number): void }>();
</script>

<template>
  <nav aria-label="Etapas do complemento de cadastro">
    <ol class="ox-stepper">
      <li v-for="(rotulo, indice) in ETAPAS" :key="rotulo" class="ox-stepper__passo">
        <span v-if="indice > 0" class="ox-stepper__traco" aria-hidden="true" />
        <button
          type="button"
          class="ox-stepper__botao"
          :class="{
            'ox-stepper__botao--feito': indice + 1 < atual,
            'ox-stepper__botao--atual': indice + 1 === atual,
          }"
          :aria-current="indice + 1 === atual ? 'step' : undefined"
          @click="emit('ir', indice + 1)"
        >
          <span class="ox-stepper__bola" aria-hidden="true">
            <v-icon v-if="indice + 1 < atual" icon="mdi-check" size="15" />
            <template v-else>{{ indice + 1 }}</template>
          </span>
          <span class="ox-stepper__rotulo">{{ rotulo }}</span>
        </button>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.ox-stepper {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
  flex-wrap: wrap;
}

.ox-stepper__passo {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
}

.ox-stepper__traco {
  width: 24px;
  height: 2px;
  background: var(--rg-color-border-base);
}

.ox-stepper__botao {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  padding: 0;
  border: none;
  background: none;
  font-family: inherit;
  cursor: pointer;
}

.ox-stepper__bola {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--rg-radius-pill);
  background: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-muted);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
}

.ox-stepper__rotulo {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-muted);
  white-space: nowrap;
}

.ox-stepper__botao--feito .ox-stepper__bola,
.ox-stepper__botao--atual .ox-stepper__bola {
  background: var(--rg-color-action-primary);
  color: var(--rg-color-text-on-brand);
}

.ox-stepper__botao--feito .ox-stepper__rotulo {
  color: var(--rg-color-text-secondary);
}

.ox-stepper__botao--atual .ox-stepper__rotulo {
  color: var(--rg-color-text-primary);
  font-weight: var(--rg-font-weight-semibold);
}

.ox-stepper__botao:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
  border-radius: var(--rg-radius-sm);
}
</style>
