<script setup lang="ts">
/**
 * Escolha Sim/Não do complemento — segmentado de dois botões, como no Figma.
 *
 * Semanticamente é um grupo de radios (`role="radiogroup"` + `role="radio"`),
 * porque as opções são mutuamente exclusivas; visualmente segue o seletor
 * segmentado da área gestora (selecionado em `surface-brand` + texto brand).
 */
import type { RespostaSimNao } from '@/stores/complemento';

defineProps<{
  modelValue: RespostaSimNao;
  /** Rótulo acessível do grupo — a pergunta que ele responde. */
  rotulo: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', valor: RespostaSimNao): void }>();

const OPCOES = [
  { valor: 'sim', rotulo: 'Sim' },
  { valor: 'nao', rotulo: 'Não' },
] as const;
</script>

<template>
  <div class="ox-simnao" role="radiogroup" :aria-label="rotulo">
    <button
      v-for="opcao in OPCOES"
      :key="opcao.valor"
      type="button"
      role="radio"
      class="ox-simnao__opcao"
      :class="{ 'ox-simnao__opcao--ativa': modelValue === opcao.valor }"
      :aria-checked="modelValue === opcao.valor"
      @click="emit('update:modelValue', opcao.valor)"
    >
      {{ opcao.rotulo }}
    </button>
  </div>
</template>

<style scoped>
.ox-simnao {
  display: inline-flex;
  flex-shrink: 0;
  border: 1px solid var(--rg-color-border-base);
  border-radius: var(--rg-radius-md);
  overflow: hidden;
  background: var(--rg-color-surface-base);
}

.ox-simnao__opcao {
  min-width: 64px;
  height: 36px;
  padding-inline: var(--rg-space-4);
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
  cursor: pointer;
  transition:
    background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard),
    color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.ox-simnao__opcao + .ox-simnao__opcao {
  border-left: 1px solid var(--rg-color-border-subtle);
}

.ox-simnao__opcao--ativa {
  background: var(--rg-color-surface-brand);
  color: var(--rg-color-text-brand);
  font-weight: var(--rg-font-weight-semibold);
}

.ox-simnao__opcao:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: -2px;
}
</style>
