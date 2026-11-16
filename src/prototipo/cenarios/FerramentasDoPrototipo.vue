<script setup lang="ts">
/**
 * Ferramentas do protótipo na tela do operador: CAMADA DO PROTÓTIPO, FORA DO PRODUTO.
 *
 * Até 16/11/2026 esta faixa morava dentro da OperadorComplementoPage. Saiu de lá para a página poder ir ao
 * desenvolvimento sem ela (docs/sistema/CAMADA-DE-PROTOTIPO.md). Fica fixa no canto inferior esquerdo, tracejada e
 * marcada como do protótipo; o painel das jornadas ocupa o canto direito.
 */
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { useComplementoStore } from '@/stores/complemento';
import { getActivePinia } from 'pinia';

import { ligarGanchoDaSimulacao, reiniciarDemonstracao, simulandoAnalise } from './complemento';

const route = useRoute();
const naTelaDoOperador = computed(() => route.name === 'operador');

/** A store é lida a cada uso: um cenário aplicado troca a store por uma nova. */
const situacao = computed(() => (naTelaDoOperador.value ? useComplementoStore().situacao : null));

watchEffect(() => {
  const pinia = getActivePinia();
  if (naTelaDoOperador.value && pinia) ligarGanchoDaSimulacao(pinia);
});
</script>

<template>
  <aside v-if="naTelaDoOperador" class="px-ferramentas" data-prototipo aria-label="Ferramentas do protótipo">
    <span class="px-ferramentas__marca">Protótipo</span>
    <button
      v-if="situacao === 'enviado'"
      type="button"
      class="px-ferramentas__botao"
      :aria-pressed="simulandoAnalise"
      @click="simulandoAnalise = !simulandoAnalise"
    >
      {{ simulandoAnalise ? 'A análise começa ao salvar (ligado)' : 'Simular a análise começando ao salvar' }}
    </button>
    <button type="button" class="px-ferramentas__botao" @click="reiniciarDemonstracao('/operador')">
      Reiniciar demonstração
    </button>
  </aside>
</template>

<style scoped>
.px-ferramentas {
  position: fixed;
  left: var(--rg-space-4);
  bottom: var(--rg-space-4);
  z-index: 35;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rg-space-3);
  max-width: calc(100vw - 2 * var(--rg-space-4));
  padding: var(--rg-space-2) var(--rg-space-3);
  border: 1px dashed var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-raised);
  font-family: var(--rg-font-family-sans);
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
}

.px-ferramentas__marca {
  font-weight: var(--rg-font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--rg-letter-spacing-wide);
}

.px-ferramentas__botao {
  padding: var(--rg-space-1) var(--rg-space-2);
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  font-family: inherit;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-secondary);
  text-decoration: underline;
  cursor: pointer;
}

.px-ferramentas__botao[aria-pressed='true'] {
  color: var(--rg-color-text-brand);
  font-weight: var(--rg-font-weight-semibold);
}

.px-ferramentas__botao:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}
</style>
