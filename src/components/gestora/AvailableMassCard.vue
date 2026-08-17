<script setup lang="ts">
/**
 * Card "Relatório de Massas Disponível (T)": uma coluna por material, com o fio de
 * cor do material na lateral — as cores vêm dos tokens `--rg-data-material-*`, que
 * já existiam para tabelas de massa.
 *
 * O fio é redundante de propósito: o nome do material está escrito ao lado, então
 * a cor identifica sem ser o único canal.
 */
import type { MassaDisponivel } from '@/data/mocks/perfis';

defineProps<{ itens: MassaDisponivel[]; total: string }>();
</script>

<template>
  <section class="gx-avail" aria-labelledby="gx-avail-titulo">
    <header class="gx-avail__head">
      <h2 id="gx-avail-titulo" class="gx-avail__titulo">Relatório de Massas Disponível (T)</h2>
      <p class="gx-avail__total">Total disponível: {{ total }}</p>
    </header>

    <ul class="gx-avail__lista">
      <li
        v-for="item in itens"
        :key="item.material"
        class="gx-avail__item"
        :style="{ '--gx-material': item.cor }"
      >
        <span class="gx-avail__material">{{ item.material }}</span>
        <span class="gx-avail__valor">{{ item.valor }}</span>
        <span class="gx-avail__unidade">toneladas</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.gx-avail {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  padding: var(--rg-space-6);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-raised);
}

.gx-avail__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--rg-space-2) var(--rg-space-4);
}

.gx-avail__titulo {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: 22px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-avail__total {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

.gx-avail__lista {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--rg-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.gx-avail__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--rg-space-3) var(--rg-space-4);
  border-left: 4px solid var(--gx-material);
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-subtle);
}

.gx-avail__material {
  font-size: var(--rg-font-size-2xs);
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0.06em;
  color: var(--gx-material);
}

.gx-avail__valor {
  font-size: var(--rg-font-size-xl);
  line-height: 26px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-avail__unidade {
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-muted);
}

@media (max-width: 720px) {
  .gx-avail__lista {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
