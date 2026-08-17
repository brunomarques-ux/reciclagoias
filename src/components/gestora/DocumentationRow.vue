<script setup lang="ts">
/**
 * Linha do card "Status da Documentação" — o módulo que se adapta sozinho
 * (docs/sistema/DECISOES-UX.md, D-R003 · tira "Status da Documentação · variações"):
 *
 *   0 documentos → frase, sem barra e sem contagem
 *   1 status     → contagem com ponto colorido, sem barra
 *   2+ status    → barra empilhada + contagem por status, que quebra em duas linhas
 *
 * Status zerado não aparece: mostrar "0 retificados" gasta linha para não dizer nada.
 */
import { computed } from 'vue';

import type { LinhaDocumentacao } from '@/data/mocks/gestora';
import StackedBar from './StackedBar.vue';
import { COR_TONE } from './tones';

const props = defineProps<{ linha: LinhaDocumentacao }>();

const statuses = computed(() => props.linha.statuses.filter((s) => s.quantidade > 0));
const temBarra = computed(() => statuses.value.length >= 2);

function rotulo(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}
</script>

<template>
  <li class="gx-doc-row">
    <span class="gx-doc-row__icone" aria-hidden="true">
      <v-icon :icon="linha.icone" size="18" />
    </span>

    <div class="gx-doc-row__texto">
      <p class="gx-doc-row__l1">
        <span class="gx-doc-row__titulo">{{ linha.titulo }}</span>
        <span class="gx-doc-row__total">{{ linha.total }} no total</span>
      </p>

      <p v-if="linha.total === 0" class="gx-doc-row__vazio">{{ linha.fraseVazia }}</p>

      <template v-else>
        <StackedBar v-if="temBarra" :statuses="statuses" />

        <ul class="gx-doc-row__l2">
          <li v-for="status in statuses" :key="status.singular" class="gx-doc-row__parte">
            <span
              class="gx-doc-row__ponto"
              :style="{ backgroundColor: COR_TONE[status.tone] }"
              aria-hidden="true"
            />
            {{ rotulo(status.quantidade, status.singular, status.plural) }}
          </li>
        </ul>
      </template>
    </div>

    <button type="button" class="gx-doc-row__link" aria-disabled="true">
      {{ linha.linkRotulo }}
      <span class="gx-doc-row__breve">em breve</span>
      <v-icon icon="mdi-chevron-right" size="14" aria-hidden="true" />
    </button>
  </li>
</template>

<style scoped>
.gx-doc-row {
  display: flex;
  align-items: center;
  gap: var(--rg-space-4);
  padding: var(--rg-space-4) 0;
}

.gx-doc-row + .gx-doc-row {
  border-top: 1px solid var(--rg-color-border-subtle);
}

.gx-doc-row__icone {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--rg-radius-md);
  background-color: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-brand);
}

.gx-doc-row__texto {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.gx-doc-row__l1 {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--rg-space-2);
  margin: 0;
}

.gx-doc-row__titulo {
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-doc-row__total {
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-muted);
}

.gx-doc-row__vazio {
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-muted);
}

.gx-doc-row__l2 {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rg-space-1) 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.gx-doc-row__parte {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  line-height: 18px;
  color: var(--rg-color-text-secondary);
}

.gx-doc-row__ponto {
  width: 8px;
  height: 8px;
  border-radius: var(--rg-radius-pill);
}

.gx-doc-row__link {
  display: flex;
  align-items: center;
  gap: var(--rg-space-1);
  flex-shrink: 0;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  line-height: 18px;
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-brand);
  cursor: default;
}

/* O estado precisa estar escrito: `title` não chega ao teclado nem ao toque, e sem
   ele este link fica idêntico ao gatilho vivo do popover. */
.gx-doc-row__breve {
  font-size: var(--rg-font-size-2xs);
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--rg-color-text-muted);
}

.gx-doc-row__link:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
  border-radius: var(--rg-radius-xs);
}

/* Sem largura para o link ao lado do texto, ele desce alinhado ao conteúdo. */
@media (max-width: 720px) {
  .gx-doc-row {
    flex-wrap: wrap;
  }

  .gx-doc-row__link {
    margin-left: 52px;
  }
}
</style>
