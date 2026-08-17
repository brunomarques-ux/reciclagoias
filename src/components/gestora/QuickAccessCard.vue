<script setup lang="ts">
/**
 * Card "Acesso Rápido" da coluna lateral — atalhos para as listagens do perfil.
 *
 * O último botão é o preenchido: é o destino mais provável do perfil. Enquanto as
 * telas de destino não existem, os botões ficam inertes **com o estado escrito**
 * ("em breve" visível), e não só no `title` — atributo que teclado e toque não leem.
 */
defineProps<{ acoes: { rotulo: string; primario?: boolean }[] }>();
</script>

<template>
  <section class="gx-quick">
    <h2 class="gx-quick__titulo">Acesso Rápido</h2>

    <ul class="gx-quick__lista">
      <li v-for="acao in acoes" :key="acao.rotulo">
        <button
          type="button"
          class="gx-quick__botao"
          :class="{ 'gx-quick__botao--primario': acao.primario }"
          aria-disabled="true"
        >
          {{ acao.rotulo }}
          <span class="gx-quick__breve">em breve</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.gx-quick {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  padding: var(--rg-space-5);
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-lg);
  background-color: var(--rg-color-surface-raised);
}

.gx-quick__titulo {
  margin: 0;
  font-size: var(--rg-font-size-md);
  line-height: 22px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-primary);
}

.gx-quick__lista {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.gx-quick__botao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-2);
  width: 100%;
  height: 48px;
  padding: 0 var(--rg-space-5);
  border: 1.5px solid var(--rg-color-border-brand);
  border-radius: var(--rg-radius-md);
  background-color: transparent;
  font-family: inherit;
  font-size: 15px;
  line-height: 20px;
  font-weight: var(--rg-font-weight-semibold);
  color: var(--rg-color-text-brand);
  cursor: default;
}

.gx-quick__botao--primario {
  border-color: var(--rg-color-action-primary);
  background-color: var(--rg-color-action-primary);
  color: var(--rg-color-text-on-brand);
}

.gx-quick__breve {
  font-size: var(--rg-font-size-2xs);
  line-height: 14px;
  font-weight: var(--rg-font-weight-semibold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0.72;
}

.gx-quick__botao:focus-visible {
  outline: none;
  box-shadow: var(--rg-ring-focus);
}
</style>
