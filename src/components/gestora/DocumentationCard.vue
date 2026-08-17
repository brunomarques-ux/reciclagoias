<script setup lang="ts">
/**
 * Card "Status da Documentação" (título é requisição do cliente e fica).
 * Uma linha por tipo de documento; a linha é o módulo e se adapta sozinha —
 * quem faz isso é a `DocumentationRow` (D-R003).
 */
import type { LinhaDocumentacao } from '@/data/mocks/gestora';
import DocumentationRow from './DocumentationRow.vue';

withDefaults(
  defineProps<{ anoExecucao: number; linhas: LinhaDocumentacao[]; descricao?: string }>(),
  { descricao: 'Planos, relatórios e certificados de massa do ano de execução' },
);
</script>

<template>
  <section class="gx-doc-card" aria-labelledby="gx-doc-card-titulo">
    <header class="gx-doc-card__head">
      <h2 id="gx-doc-card-titulo" class="gx-doc-card__titulo">Status da Documentação</h2>
      <p class="gx-doc-card__descricao">{{ descricao }} {{ anoExecucao }}.</p>
    </header>

    <ul class="gx-doc-card__lista">
      <DocumentationRow v-for="linha in linhas" :key="linha.id" :linha="linha" />
    </ul>
  </section>
</template>

<style scoped>
.gx-doc-card {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  padding: var(--rg-space-6);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-raised);
}

.gx-doc-card__head {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
}

.gx-doc-card__titulo {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: 22px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-doc-card__descricao {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-secondary);
}

.gx-doc-card__lista {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
