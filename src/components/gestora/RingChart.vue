<script setup lang="ts">
/**
 * Anel de percentual — a taxa de recuperação de um material.
 *
 * Duas coisas moram no mesmo anel, na mesma escala: o **arco** é quanto voltou da
 * massa produzida, e a **marca** no trilho é a meta legal do exercício. Assim
 * "atingiu a meta" vira uma leitura geométrica — o arco passou da marca — em vez de
 * uma comparação de cabeça entre um percentual e um número em tonelada.
 *
 * O arco trava em 100% na geometria (dasharray acima de 100 desenha lixo), mas o
 * número no centro é sempre o valor real: é o que impede o anel de dizer 100%
 * enquanto os números embaixo dizem 174%.
 *
 * Faixas de cor: 100% ou mais em verde, abaixo de 60% em âmbar, o meio em neutro.
 * O tom é da taxa, não do cumprimento da meta — o chip do card é quem diz se a
 * obrigação legal foi cumprida.
 */
import { computed } from 'vue';

export type TomAnel = 'success' | 'atencao' | 'neutro';

const props = withDefaults(
  defineProps<{ percentual: number; marca?: number; tom?: TomAnel; tamanho?: number }>(),
  { tamanho: 112, tom: 'neutro' },
);

const RAIO = 15.9155;
const ESPESSURA = 6;
/** Largura da marca da meta, em unidades de porcentagem da circunferência. */
const LARGURA_MARCA = 1.6;

const preenchido = computed(() => Math.max(0, Math.min(props.percentual, 100)));
const dasharray = computed(() => `${preenchido.value} ${100 - preenchido.value}`);

const marcaDasharray = computed(() => `${LARGURA_MARCA} ${100 - LARGURA_MARCA}`);
const marcaOffset = computed(() => 25 - (props.marca ?? 0));

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
      <circle
        v-if="marca !== undefined"
        class="gx-ring__marca"
        cx="21"
        cy="21"
        :r="RAIO"
        fill="transparent"
        :stroke-width="ESPESSURA"
        :stroke-dasharray="marcaDasharray"
        :stroke-dashoffset="marcaOffset"
      />
    </svg>

    <div class="gx-ring__centro">
      <span class="gx-ring__valor" :class="`gx-ring__valor--${tom}`">{{ texto }}</span>
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

.gx-ring__arco--neutro {
  stroke: var(--rg-color-text-secondary);
}

/* A marca corta o arco: fica por cima para continuar visível quando a meta já foi
   ultrapassada, que é o caso mais comum. */
.gx-ring__marca {
  stroke: var(--rg-color-surface-raised);
}

.gx-ring__centro {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Só o número dentro do anel: o miolo tem ~69px de diâmetro e qualquer palavra ali
   encosta no traço. O que o número significa fica escrito logo abaixo do anel. */
.gx-ring__valor {
  font-size: var(--rg-font-size-lg);
  line-height: 24px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-ring__valor--success {
  color: var(--rg-color-text-brand);
}

.gx-ring__valor--atencao {
  color: var(--rg-primitive-amber-700);
}
</style>
