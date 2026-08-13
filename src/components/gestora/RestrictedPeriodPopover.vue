<script setup lang="ts">
/**
 * Popover do período restritivo (D-R001 · tira "Popover · dimensões").
 *
 * 324px de largura, ancorado abaixo do gatilho, aberto por clique e **sem scrim**:
 * é consulta, não decisão — não bloqueia a tela. Não é modal (custo de acessibilidade)
 * e não é hover (em toque hover não existe, e dispararia WCAG 1.4.13).
 *
 * Cabeçalho, explicação e a linha "liberadas até DD/MM" ficam fixos; acima de 11 ações
 * só a lista rola, travada em 240px.
 */
import { computed } from 'vue';

import { LIMITE_SEM_ROLAGEM, POPOVER_RESTRITIVO, type AcaoLiberada } from '@/data/mocks/gestora';

const props = defineProps<{ id: string; acoes: AcaoLiberada[]; ate: string }>();

defineEmits<{ (e: 'fechar'): void }>();

const rola = computed(() => props.acoes.length > LIMITE_SEM_ROLAGEM);
const eyebrow = computed(
  () => `${props.acoes.length === 1 ? 'Liberado' : 'Liberadas'} até ${props.ate}`,
);
</script>

<template>
  <div :id="id" class="gx-popover">
    <div class="gx-popover__head">
      <v-icon class="gx-popover__info" icon="mdi-information-outline" size="16" aria-hidden="true" />
      <h3 class="gx-popover__titulo">{{ POPOVER_RESTRITIVO.titulo }}</h3>
      <button
        type="button"
        class="gx-popover__fechar"
        aria-label="Fechar"
        @click="$emit('fechar')"
      >
        <v-icon icon="mdi-close" size="16" />
      </button>
    </div>

    <p class="gx-popover__descricao">{{ POPOVER_RESTRITIVO.descricao }}</p>

    <span class="gx-popover__divisor" aria-hidden="true" />

    <p class="gx-popover__eyebrow">{{ eyebrow }}</p>

    <ul class="gx-popover__lista" :class="{ 'gx-popover__lista--rola': rola }">
      <li v-for="acao in acoes" :key="acao.rotulo" class="gx-popover__acao">
        <v-icon class="gx-popover__check" icon="mdi-check" size="14" aria-hidden="true" />
        {{ acao.rotulo }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.gx-popover {
  position: absolute;
  top: calc(100% + 10px);
  left: -12px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  width: 324px;
  padding: var(--rg-space-4);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-raised);
  box-shadow: var(--rg-elevation-3);
  text-align: left;
}

.gx-popover__head {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
}

.gx-popover__info {
  color: var(--rg-color-feedback-danger);
}

.gx-popover__titulo {
  flex: 1;
  margin: 0;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-popover__fechar {
  display: grid;
  place-items: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--rg-color-text-muted);
  cursor: pointer;
}

.gx-popover__fechar:hover {
  color: var(--rg-color-text-primary);
}

.gx-popover__fechar:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
  border-radius: var(--rg-radius-xs);
}

.gx-popover__descricao {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.gx-popover__divisor {
  height: 1px;
  background-color: var(--rg-color-border-subtle);
}

.gx-popover__eyebrow {
  margin: 0;
  font-size: var(--rg-font-size-2xs);
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}

.gx-popover__lista {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Acima de 11 ações a lista trava e rola; o resto do popover fica parado. */
.gx-popover__lista--rola {
  max-height: 240px;
  padding-right: var(--rg-space-3);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--rg-color-border-base) var(--rg-color-border-subtle);
}

.gx-popover__lista--rola::-webkit-scrollbar {
  width: 4px;
}

.gx-popover__lista--rola::-webkit-scrollbar-track {
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-border-subtle);
}

.gx-popover__lista--rola::-webkit-scrollbar-thumb {
  border-radius: var(--rg-radius-pill);
  background-color: var(--rg-color-border-base);
}

.gx-popover__acao {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-2);
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-primary);
}

.gx-popover__check {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--rg-color-feedback-success);
}
</style>
