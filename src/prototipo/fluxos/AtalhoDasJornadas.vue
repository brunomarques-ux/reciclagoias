<script setup lang="ts">
/**
 * Atalho das jornadas: CAMADA DO PROTÓTIPO, FORA DO PRODUTO (pedido do Bruno, 16/11/2026, como no SISLOG).
 *
 * Fica no pé do menu lateral, em todas as telas logadas, e leva à seleção de jornadas (/fluxos). Substitui o rodapé
 * do explorador de cenários. Não é item do menu: o menu vai para o desenvolvimento, o atalho não. É montado pela raiz
 * das jornadas por cima do menu, na mesma largura dele (só o ícone na trilha de 72px), e some com uma jornada ativa
 * (o painel já leva à lista) e nas telas sem o menu.
 */
import { nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useFluxoAtivo } from './sessao';

const route = useRoute();
const ativo = useFluxoAtivo();
const temMenu = ref(false);

watch(
  () => route.fullPath,
  () => void nextTick(() => (temMenu.value = !!document.querySelector('.gx-menu'))),
  { immediate: true, flush: 'post' },
);
</script>

<template>
  <RouterLink
    v-if="temMenu && !ativo && !String(route.name ?? '').startsWith('fluxos')"
    to="/fluxos"
    class="px-atalho"
    data-prototipo
    aria-label="Jornadas do protótipo"
    title="Fora do sistema: atalho do protótipo"
  >
    <v-icon class="px-atalho__icone" icon="mdi-cursor-default-click-outline" size="18" aria-hidden="true" />
    <span class="px-atalho__rotulo" aria-hidden="true">Jornadas do protótipo</span>
  </RouterLink>
</template>

<style scoped>
.px-atalho {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  width: 260px;
  padding: var(--rg-space-3) var(--rg-space-5);
  border-top: 1px dashed var(--rg-color-border-base);
  border-right: 1px solid var(--rg-color-border-subtle);
  background: var(--rg-color-surface-raised);
  font-family: var(--rg-font-family-sans);
  font-size: var(--rg-font-size-xs);
  line-height: 16px;
  color: var(--rg-color-text-muted);
  text-decoration: none;
}

.px-atalho__icone {
  color: var(--rg-color-text-muted);
}

.px-atalho:hover {
  color: var(--rg-color-text-brand);
}

.px-atalho:hover .px-atalho__icone {
  color: var(--rg-color-text-brand);
}

.px-atalho:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: -2px;
}

/* trilha de ícones do menu (SideMenuRecicla, abaixo de 1024px) */
@media (max-width: 1023px) {
  .px-atalho {
    width: 72px;
    justify-content: center;
    padding-inline: 0;
  }

  .px-atalho__rotulo {
    display: none;
  }
}
</style>
