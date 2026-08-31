<script setup lang="ts">
/**
 * Opção de lista do complemento — checkbox ou radio nativo com `accent-color`,
 * o mesmo padrão do explorador de cenários (label envolve o input; nada de
 * controle desenhado à mão por cima de input escondido).
 */
withDefaults(
  defineProps<{
    rotulo: string;
    marcado: boolean;
    tipo?: 'caixa' | 'radio';
    /** Obrigatório quando `tipo === 'radio'` — agrupa os radios da pergunta. */
    nome?: string;
  }>(),
  { tipo: 'caixa', nome: undefined },
);

const emit = defineEmits<{ (e: 'alternar'): void }>();
</script>

<template>
  <label class="ox-opcao">
    <input
      class="ox-opcao__entrada"
      :type="tipo === 'radio' ? 'radio' : 'checkbox'"
      :name="nome"
      :checked="marcado"
      @change="emit('alternar')"
    />
    <span class="ox-opcao__rotulo">{{ rotulo }}</span>
  </label>
</template>

<style scoped>
.ox-opcao {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  min-width: 0;
  cursor: pointer;
}

.ox-opcao__entrada {
  width: 18px;
  height: 18px;
  margin: 0;
  flex-shrink: 0;
  accent-color: var(--rg-color-action-primary);
  cursor: pointer;
}

.ox-opcao__rotulo {
  font-size: var(--rg-font-size-sm);
  color: var(--rg-primitive-neutral-700);
}
</style>
