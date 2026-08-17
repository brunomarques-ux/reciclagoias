<script setup lang="ts">
/**
 * Anel da taxa de recuperação de um material: quanto voltou do que foi colocado no
 * mercado.
 *
 * A taxa **pode passar de 100%** — recuperar mais massa do que se produziu no
 * exercício é resultado possível, e é o caso do papel. O arco trava em 100% porque
 * um anel cheio é cheio; o número no centro continua o valor real.
 *
 * A cor diz uma coisa só: bateu ou não bateu a meta do exercício. Verde de sucesso
 * quando bateu, âmbar de atenção quando ficou abaixo — os dois da paleta de
 * semântica, sem tom intermediário inventado.
 */
import { computed } from 'vue';

export type TomAnel = 'success' | 'atencao';

const props = withDefaults(
  defineProps<{ percentual: number; tom?: TomAnel; tamanho?: number }>(),
  { tamanho: 112, tom: 'success' },
);

const RAIO = 15.9155;
const ESPESSURA = 6;

const preenchido = computed(() => Math.max(0, Math.min(props.percentual, 100)));
const dasharray = computed(() => `${preenchido.value} ${100 - preenchido.value}`);

const texto = computed(
  () => `${props.percentual.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
);
</script>

<template>
  <div class="gx-ring" :style="{ width: `${tamanho}px`, height: `${tamanho}px` }">
    <svg viewBox="0 0 42 42" class="gx-ring__svg" aria-hidden="true">
      <circle class="gx-ring__trilho" cx="21" cy="21" :r="RAIO" fill="transparent" :stroke-width="ESPESSURA" />
      <circle
        class="gx-ring__arco"
        :class="`gx-ring__arco--${tom}`"
        cx="21"
        cy="21"
        :r="RAIO"
        fill="transparent"
        :stroke-width="ESPESSURA"
        :stroke-dasharray="dasharray"
        stroke-dashoffset="25"
        stroke-linecap="round"
      />
    </svg>

    <div class="gx-ring__centro">
      <span class="gx-ring__valor">{{ texto }}</span>
    </div>
  </div>
</template>

<style scoped>
.gx-ring {
  position: relative;
  flex-shrink: 0;
}

.gx-ring__svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gx-ring__trilho {
  stroke: var(--rg-color-surface-raised);
}

.gx-ring__arco--success {
  stroke: var(--rg-color-feedback-success);
}

.gx-ring__arco--atencao {
  stroke: var(--rg-color-feedback-warning);
}

.gx-ring__centro {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* O número fica neutro: quem carrega o estado é a cor do arco e o chip do cartão. */
.gx-ring__valor {
  font-size: var(--rg-font-size-lg);
  line-height: 24px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}
</style>
