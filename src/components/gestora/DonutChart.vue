<script setup lang="ts">
/**
 * Rosca de proporção — usada na Distribuição de Usuários.
 *
 * Proporção de um todo com poucas categorias e leitura de relance: aqui o círculo
 * ganha do empilhamento, porque a soma é o assunto (54 usuários) e não a comparação
 * entre categorias. Onde o assunto é comparar quantidades exatas, a barra empilhada
 * continua (D-R003) — comparar comprimento é mais preciso que comparar ângulo.
 *
 * O gráfico é `aria-hidden`: cada fatia aparece escrita na legenda ao lado.
 * O truque do raio 15.9155 deixa a circunferência valendo 100, então cada fatia é
 * literalmente a sua porcentagem em `stroke-dasharray`.
 */
import { computed } from 'vue';

import type { StatusTone } from '@/data/mocks/gestora';
import { COR_TONE } from './tones';

const props = withDefaults(
  defineProps<{
    fatias: { quantidade: number; tone: StatusTone }[];
    total: number;
    tamanho?: number;
    rotuloCentro?: string;
  }>(),
  { tamanho: 120, rotuloCentro: 'Total' },
);

const RAIO = 15.9155;
const ESPESSURA = 7;
/** Respiro entre fatias, em unidades de porcentagem da circunferência. */
const RESPIRO = 1.2;

const segmentos = computed(() => {
  const validas = props.fatias.filter((f) => f.quantidade > 0);
  let acumulado = 0;

  return validas.map((fatia) => {
    const porcentagem = props.total > 0 ? (fatia.quantidade / props.total) * 100 : 0;
    const traco = Math.max(porcentagem - (validas.length > 1 ? RESPIRO : 0), 0.5);
    const segmento = {
      cor: COR_TONE[fatia.tone],
      dasharray: `${traco} ${100 - traco}`,
      dashoffset: 25 - acumulado,
    };
    acumulado += porcentagem;
    return segmento;
  });
});
</script>

<template>
  <div class="gx-donut" :style="{ width: `${tamanho}px`, height: `${tamanho}px` }">
    <svg viewBox="0 0 42 42" class="gx-donut__svg" aria-hidden="true">
      <circle
        class="gx-donut__trilho"
        cx="21"
        cy="21"
        :r="RAIO"
        fill="transparent"
        :stroke-width="ESPESSURA"
      />
      <circle
        v-for="(seg, i) in segmentos"
        :key="i"
        cx="21"
        cy="21"
        :r="RAIO"
        fill="transparent"
        :stroke="seg.cor"
        :stroke-width="ESPESSURA"
        :stroke-dasharray="seg.dasharray"
        :stroke-dashoffset="seg.dashoffset"
      />
    </svg>

    <div class="gx-donut__centro">
      <span class="gx-donut__valor">{{ total }}</span>
      <span class="gx-donut__rotulo">{{ rotuloCentro }}</span>
    </div>
  </div>
</template>

<style scoped>
.gx-donut {
  position: relative;
  flex-shrink: 0;
}

.gx-donut__svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.gx-donut__trilho {
  stroke: var(--rg-color-surface-subtle);
}

.gx-donut__centro {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.gx-donut__valor {
  font-size: var(--rg-font-size-xl);
  line-height: 26px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-donut__rotulo {
  font-size: var(--rg-font-size-2xs);
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}
</style>
