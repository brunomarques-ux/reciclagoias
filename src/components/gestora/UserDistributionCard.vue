<script setup lang="ts">
/**
 * Card "Distribuição de Usuários" do dashboard do admin: rosca + legenda escrita.
 *
 * A rosca responde "está equilibrado ou tem uma fatia dominante?" de relance; a
 * contagem ao lado responde "quantos exatamente?". Nenhuma das duas sozinha resolve.
 *
 * Hierarquia dentro da legenda: a quantidade é o dado, o rótulo é o contexto — por
 * isso pesos diferentes. E a porcentagem, que é detalhe, só aparece quando a pessoa
 * pede: passar o mouse ou focar um item da legenda troca o miolo da rosca pela
 * quantidade e pela porcentagem daquela categoria.
 *
 * A legenda é feita de `<button>` porque ela é o que recebe o foco — o SVG fica
 * `aria-hidden`. Assim o detalhe existe no teclado e no toque, não só no mouse.
 */
import { computed, ref } from 'vue';

import type { FatiaUsuarios } from '@/data/mocks/perfis';
import DonutChart from './DonutChart.vue';
import { COR_TONE } from './tones';

const props = defineProps<{ fatias: FatiaUsuarios[] }>();

const total = computed(() => props.fatias.reduce((soma, f) => soma + f.quantidade, 0));
const destaque = ref<number | null>(null);

function porcentagem(quantidade: number) {
  if (!total.value) return '0%';
  return `${((quantidade / total.value) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

function aoTeclar(evento: KeyboardEvent) {
  if (evento.key === 'Escape') destaque.value = null;
}
</script>

<template>
  <section class="gx-users" aria-labelledby="gx-users-titulo" @keydown="aoTeclar">
    <header class="gx-users__head">
      <h2 id="gx-users-titulo" class="gx-users__titulo">Distribuição de Usuários</h2>
      <p class="gx-users__total">{{ total }} no total</p>
    </header>

    <div class="gx-users__corpo">
      <DonutChart :fatias="fatias" :total="total" :tamanho="120" :destaque="destaque" />

      <ul class="gx-users__legenda">
        <li v-for="(fatia, indice) in fatias" :key="fatia.rotulo">
          <button
            type="button"
            class="gx-users__parte"
            :class="{ 'gx-users__parte--ativa': destaque === indice }"
            @mouseenter="destaque = indice"
            @mouseleave="destaque = null"
            @focus="destaque = indice"
            @blur="destaque = null"
            @click="destaque = destaque === indice ? null : indice"
          >
            <span
              class="gx-users__ponto"
              :style="{ backgroundColor: COR_TONE[fatia.tone] }"
              aria-hidden="true"
            />
            <span class="gx-users__quantidade">{{ fatia.quantidade }}</span>
            <span class="gx-users__rotulo">{{ fatia.rotulo }}</span>
            <span class="gx-users__percentual">{{ porcentagem(fatia.quantidade) }}</span>
          </button>
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
  gap: var(--rg-space-1);
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gx-users__parte {
  display: flex;
  align-items: baseline;
  gap: var(--rg-space-2);
  width: 100%;
  padding: var(--rg-space-1) var(--rg-space-2);
  border: none;
  border-radius: var(--rg-radius-sm);
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.gx-users__parte:hover,
.gx-users__parte--ativa {
  background-color: var(--rg-color-surface-subtle);
}

.gx-users__parte:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 1px;
}

.gx-users__ponto {
  flex-shrink: 0;
  align-self: center;
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
}

/* A quantidade é o dado; o rótulo é o contexto; a porcentagem é o detalhe. */
.gx-users__quantidade {
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-users__rotulo {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.gx-users__percentual {
  flex-shrink: 0;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-muted);
  opacity: 0;
  transition: opacity var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.gx-users__parte:hover .gx-users__percentual,
.gx-users__parte:focus-visible .gx-users__percentual,
.gx-users__parte--ativa .gx-users__percentual {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .gx-users__parte,
  .gx-users__percentual {
    transition: none;
  }
}

@media (max-width: 380px) {
  .gx-users__corpo {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
