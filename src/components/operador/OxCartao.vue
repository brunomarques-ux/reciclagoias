<script setup lang="ts">
/**
 * Cartão de bloco do complemento — o card branco de raio 12 que agrupa um
 * assunto da etapa (identificação, documentos, serviços…). Título de 16,
 * descrição opcional, corpo no slot.
 */
withDefaults(defineProps<{ titulo: string; descricao?: string }>(), { descricao: undefined });
</script>

<template>
  <section class="ox-cartao">
    <header class="ox-cartao__cabecalho">
      <h2 class="ox-cartao__titulo">{{ titulo }}</h2>
      <p v-if="descricao" class="ox-cartao__descricao">{{ descricao }}</p>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.ox-cartao {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-5);
  padding: var(--rg-space-6);
  background: var(--rg-color-surface-raised);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
}

.ox-cartao__cabecalho {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
}

.ox-cartao__titulo {
  margin: 0;
  font-size: var(--rg-font-size-md);
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.ox-cartao__descricao {
  margin: 0;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-secondary);
  line-height: var(--rg-line-height-base);
}
</style>
