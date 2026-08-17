<script setup lang="ts">
/**
 * Card "Distribuição de Usuários" do dashboard do admin: rosca + legenda escrita.
 *
 * A rosca responde "está equilibrado ou tem uma fatia dominante?" de relance; a
 * contagem ao lado responde "quantos exatamente?". Nenhuma das duas sozinha resolve,
 * e é por isso que as duas ficam.
 */
import { computed } from 'vue';

import type { FatiaUsuarios } from '@/data/mocks/perfis';
import DonutChart from './DonutChart.vue';
import { COR_TONE } from './tones';

const props = defineProps<{ fatias: FatiaUsuarios[] }>();

const total = computed(() => props.fatias.reduce((soma, f) => soma + f.quantidade, 0));
</script>

<template>
  <section class="gx-users" aria-labelledby="gx-users-titulo">
    <header class="gx-users__head">
      <h2 id="gx-users-titulo" class="gx-users__titulo">Distribuição de Usuários</h2>
      <p class="gx-users__total">{{ total }} no total</p>
    </header>

    <div class="gx-users__corpo">
      <DonutChart :fatias="fatias" :total="total" :tamanho="120" />

      <ul class="gx-users__legenda">
        <li v-for="fatia in fatias" :key="fatia.rotulo" class="gx-users__parte">
          <span
            class="gx-users__ponto"
            :style="{ backgroundColor: COR_TONE[fatia.tone] }"
            aria-hidden="true"
          />
          {{ fatia.quantidade }} {{ fatia.rotulo }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.gx-users {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  padding: var(--rg-space-5);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-raised);
}

.gx-users__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-2);
}

.gx-users__titulo {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: 22px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-users__total {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-muted);
}

.gx-users__corpo {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
}

.gx-users__legenda {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gx-users__parte {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.gx-users__ponto {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
}

@media (max-width: 380px) {
  .gx-users__corpo {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
