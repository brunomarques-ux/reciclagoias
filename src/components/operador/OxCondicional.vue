<script setup lang="ts">
/**
 * Moldura de resposta condicional — a guia verde à esquerda que marca campo
 * aberto por uma resposta ("outro" marcado, "sim" que pede detalhe).
 *
 * Padrão único para todo condicional do complemento, decisão de 31/08: nada de
 * campo avulso nem link "adicionar"; a opção marcada é que abre a descrição.
 */
</script>

<template>
  <div class="ox-condicional">
    <span class="ox-condicional__guia" aria-hidden="true" />
    <div class="ox-condicional__conteudo">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ox-condicional {
  display: flex;
  gap: var(--rg-space-3);
  padding-block: var(--rg-space-1);
}

.ox-condicional__guia {
  flex-shrink: 0;
  width: 3px;
  border-radius: var(--rg-radius-xs);
  background: var(--rg-primitive-brand-100);
}

.ox-condicional__conteudo {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--rg-space-4) var(--rg-space-5);
}

.ox-condicional__conteudo > :deep(*) {
  flex: 1 1 320px;
}
</style>
