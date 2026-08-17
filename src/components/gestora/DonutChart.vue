<script setup lang="ts">
/**
 * Rosca de proporção — usada na Distribuição de Usuários.
 *
 * Proporção de um todo com poucas categorias e leitura de relance: aqui o círculo
 * ganha do empilhamento, porque a soma é o assunto (54 usuários) e não a comparação
 * entre categorias. Onde o assunto é comparar quantidades exatas, a barra empilhada
 * continua (D-R003) — comparar comprimento é mais preciso que comparar ângulo.
 *
 * **Detalhe sob demanda:** ao passar o mouse (ou focar pelo teclado) numa fatia, o
 * miolo troca o total pela quantidade e pela porcentagem daquela categoria. O detalhe
 * aparece **dentro** do gráfico, e não numa camada flutuante, por três motivos: em
 * toque não existe hover; camada flutuante sobre o próprio elemento dispara as
 * obrigações da WCAG 1.4.13; e o miolo já era espaço morto.
 *
 * O SVG é `aria-hidden` — cada fatia está escrita na legenda ao lado, que é quem
 * recebe foco.
 */
import { computed } from 'vue';

import type { StatusTone } from '@/data/mocks/gestora';
import { COR_TONE } from './tones';

const props = withDefaults(
  defineProps<{
    fatias: { quantidade: number; tone: StatusTone; rotulo?: string }[];
    total: number;
    tamanho?: number;
    rotuloCentro?: string;
    /** Índice da fatia em destaque, ou `null` para mostrar o total. */
    destaque?: number | null;
  }>(),
  { tamanho: 120, rotuloCentro: 'Total', destaque: null },
);

const RAIO = 15.9155;
const ESPESSURA = 7;
/** Respiro entre fatias, em unidades de porcentagem da circunferência. */
const RESPIRO = 1.2;

const validas = computed(() => props.fatias.filter((f) => f.quantidade > 0));

const segmentos = computed(() => {
  let acumulado = 0;

  return validas.value.map((fatia, indice) => {
    const porcentagem = props.total > 0 ? (fatia.quantidade / props.total) * 100 : 0;
    const traco = Math.max(porcentagem - (validas.value.length > 1 ? RESPIRO : 0), 0.5);
    const segmento = {
      cor: COR_TONE[fatia.tone],
      dasharray: `${traco} ${100 - traco}`,
      dashoffset: 25 - acumulado,
      apagado: props.destaque !== null && props.destaque !== indice,
    };
    acumulado += porcentagem;
    return segmento;
  });
});

const emDestaque = computed(() =>
  props.destaque === null ? null : (validas.value[props.destaque] ?? null),
);

const porcentagemDestaque = computed(() => {
  const fatia = emDestaque.value;
  if (!fatia || props.total === 0) return '';
  return `${((fatia.quantidade / props.total) * 100).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })}%`;
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
        class="gx-donut__fatia"
        :class="{ 'gx-donut__fatia--apagada': seg.apagado }"
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

    <p class="gx-donut__centro" aria-hidden="true">
      <template v-if="emDestaque">
        <span class="gx-donut__valor">{{ emDestaque.quantidade }}</span>
        <span class="gx-donut__percentual">{{ porcentagemDestaque }}</span>
      </template>
      <template v-else>
        <span class="gx-donut__valor">{{ total }}</span>
        <span class="gx-donut__rotulo">{{ rotuloCentro }}</span>
      </template>
    </p>
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

.gx-donut__fatia {
  transition: opacity var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.gx-donut__fatia--apagada {
  opacity: 0.28;
}

.gx-donut__centro {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin: 0;
  text-align: center;
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

.gx-donut__percentual {
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

@media (prefers-reduced-motion: reduce) {
  .gx-donut__fatia {
    transition: none;
  }
}
</style>
