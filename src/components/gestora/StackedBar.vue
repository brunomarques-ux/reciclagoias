<script setup lang="ts">
/**
 * Barra empilhada do Status da Documentação (D-R003): 320×6, cantos em pílula,
 * 2px de respiro entre segmentos. Os segmentos crescem em proporção à contagem.
 *
 * Só é renderizada com 2 status ou mais — quem decide é a `DocumentationRow`, porque
 * com um status só a proporção não significa nada.
 *
 * `aria-hidden` de propósito: a mesma informação está escrita logo abaixo, em texto.
 */
import type { StatusDocumento } from '@/data/mocks/gestora';
import { COR_TONE } from './tones';

defineProps<{ statuses: StatusDocumento[] }>();
</script>

<template>
  <div class="gx-bar" aria-hidden="true">
    <span
      v-for="status in statuses"
      :key="status.singular"
      class="gx-bar__seg"
      :style="{ flexGrow: status.quantidade, backgroundColor: COR_TONE[status.tone] }"
    />
  </div>
</template>

<style scoped>
/* 320px é a medida do frame e é o piso: em telas grandes a barra cresce com a linha
   até 560px, para não virar um risquinho perdido dentro de um card largo. */
.gx-bar {
  display: flex;
  gap: 2px;
  width: clamp(320px, 28%, 560px);
  max-width: 100%;
  height: 6px;
  border-radius: var(--rg-radius-pill);
  overflow: hidden;
}

.gx-bar__seg {
  flex-basis: 0;
  min-width: 2px;
}
</style>
