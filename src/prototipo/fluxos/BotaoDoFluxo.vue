<script setup lang="ts">
/**
 * O botão da camada dos fluxos guiados (painel e página /fluxos). Fica FORA do Design System de propósito: é peça
 * do protótipo, não do produto, e não deve virar RgButton por uso. No SISLOG o painel usava o Button da biblioteca
 * e um BotaoComGlifo (glifos.tsx) para play, pausa, repetir e avançar; aqui os dois viram este botão, com os ícones
 * do @mdi/font que o repo já usa (mdi-play, mdi-pause, mdi-replay, mdi-fast-forward).
 *
 * O resto dos atributos (disabled, aria-label, @click) cai direto no <button>.
 */
withDefaults(
  defineProps<{
    rotulo: string;
    /** Ícone antes do rótulo (nome mdi, ex.: 'mdi-play'). */
    icone?: string;
    /** Ícone depois do rótulo. */
    iconeFim?: string;
    variante?: 'cheio' | 'contorno' | 'fantasma';
    tom?: 'marca' | 'neutro';
    /** pequeno 32 (padrão) · medio 36: a ação principal do painel, numa linha inteira. */
    tamanho?: 'pequeno' | 'medio';
  }>(),
  { icone: undefined, iconeFim: undefined, variante: 'cheio', tom: 'marca', tamanho: 'pequeno' },
);
</script>

<template>
  <button
    type="button"
    class="fx-botao"
    :class="[`fx-botao--${variante}`, `fx-botao--${tom}`, `fx-botao--${tamanho}`]"
  >
    <v-icon v-if="icone" class="fx-botao__icone" :icon="icone" size="18" aria-hidden="true" />
    <span class="fx-botao__rotulo">{{ rotulo }}</span>
    <v-icon v-if="iconeFim" class="fx-botao__icone" :icon="iconeFim" size="18" aria-hidden="true" />
  </button>
</template>

<style scoped>
.fx-botao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--rg-space-2);
  max-width: 100%;
  min-height: 32px;
  padding: 0 var(--rg-space-3);
  border: 1px solid transparent;
  border-radius: var(--rg-radius-md);
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  line-height: 20px;
  font-weight: var(--rg-font-weight-semibold);
  cursor: pointer;
  transition:
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}
.fx-botao--medio { min-height: 36px; padding: 0 var(--rg-space-4); }
/* o rótulo não quebra: a linha que não cabe quebra inteira para baixo (fx-painel__row) */
.fx-botao__rotulo { white-space: nowrap; }
.fx-botao__icone { flex: none; }

.fx-botao--cheio.fx-botao--marca { background: var(--rg-color-action-primary); color: var(--rg-color-text-on-brand); }
.fx-botao--cheio.fx-botao--marca:hover:not(:disabled) { background: var(--rg-color-action-primary-hover); }
.fx-botao--contorno { background: var(--rg-color-surface-raised); border-color: var(--rg-color-border-strong); color: var(--rg-color-text-primary); }
.fx-botao--contorno.fx-botao--marca { border-color: var(--rg-color-border-brand); color: var(--rg-color-text-brand); }
.fx-botao--contorno:hover:not(:disabled) { background: var(--rg-color-surface-subtle); }
.fx-botao--fantasma { background: transparent; color: var(--rg-color-text-secondary); }
.fx-botao--fantasma.fx-botao--marca { color: var(--rg-color-text-brand); }
.fx-botao--fantasma:hover:not(:disabled) { background: var(--rg-color-surface-subtle); color: var(--rg-color-text-primary); }

.fx-botao:disabled {
  border-color: transparent;
  background: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-disabled);
  cursor: not-allowed;
}
.fx-botao--fantasma:disabled { background: transparent; }

.fx-botao:focus-visible {
  outline: none;
  box-shadow: var(--rg-ring-focus);
}

@media (prefers-reduced-motion: reduce) {
  .fx-botao { transition: none; }
}
</style>
