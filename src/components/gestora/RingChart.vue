<script setup lang="ts">
/**
 * Anel de percentual — a taxa de recuperação de um material.
 *
 * Anel único, sempre no verde de sucesso do design system: a diferenciação de quem
 * fechou a meta acontece no cartão (fundo e contorno), não no gráfico. O número no
 * centro é o que dispensa a leitura do ângulo; o que ele significa fica escrito
 * logo abaixo do anel, fora do miolo — que tem ~69px e não comporta palavra.
 */
import { computed } from 'vue';

const props = withDefaults(defineProps<{ percentual: number; tamanho?: number }>(), {
  tamanho: 112,
});

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

.gx-ring__arco {
  stroke: var(--rg-color-feedback-success);
}

.gx-ring__centro {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gx-ring__valor {
  font-size: var(--rg-font-size-lg);
  line-height: 24px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}
</style>
