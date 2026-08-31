<script setup lang="ts">
/**
 * Campo de texto do complemento — rótulo em cima, caixa de 44px, raio 8.
 *
 * Réplica do componente `Field` da biblioteca no Figma (borda repouso
 * `--rg-primitive-neutral-500`, o "border/default" que não tem par semântico).
 * `travado` é o `State=locked`: dado que veio do pré-cadastro e não se edita
 * aqui — fica em leitura, com fundo sutil, mas continua legível por leitor de
 * tela (input `readonly`, não `disabled`).
 */
import { computed, useId } from 'vue';

const props = withDefaults(
  defineProps<{
    rotulo: string;
    modelValue: string;
    travado?: boolean;
    dica?: string;
    tipo?: string;
    multilinha?: boolean;
  }>(),
  { travado: false, dica: undefined, tipo: 'text', multilinha: false },
);

const emit = defineEmits<{ (e: 'update:modelValue', valor: string): void }>();

const id = useId();
const dicaId = computed(() => (props.dica ? `${id}-dica` : undefined));

function aoDigitar(evento: Event) {
  emit('update:modelValue', (evento.target as HTMLInputElement | HTMLTextAreaElement).value);
}
</script>

<template>
  <div class="ox-campo" :class="{ 'ox-campo--travado': travado }">
    <label class="ox-campo__rotulo" :for="id">{{ rotulo }}</label>

    <div class="ox-campo__caixa">
      <textarea
        v-if="multilinha"
        :id="id"
        class="ox-campo__entrada ox-campo__entrada--area"
        :value="modelValue"
        :readonly="travado"
        :aria-describedby="dicaId"
        rows="3"
        @input="aoDigitar"
      />
      <input
        v-else
        :id="id"
        class="ox-campo__entrada"
        :type="tipo"
        :value="modelValue"
        :readonly="travado"
        :aria-describedby="dicaId"
        @input="aoDigitar"
      />
    </div>

    <p v-if="dica" :id="dicaId" class="ox-campo__dica">{{ dica }}</p>
  </div>
</template>

<style scoped>
.ox-campo {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-1);
  min-width: 0;
}

.ox-campo__rotulo {
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  color: var(--rg-color-text-secondary);
}

.ox-campo__caixa {
  display: flex;
  border: 1px solid var(--rg-primitive-neutral-500);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-base);
  transition: border-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}

.ox-campo__caixa:focus-within {
  border-color: var(--rg-primitive-brand-500);
  box-shadow: var(--rg-ring-focus);
}

.ox-campo__entrada {
  flex: 1;
  min-width: 0;
  height: 42px;
  padding-inline: var(--rg-space-3);
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: var(--rg-font-size-sm);
  color: var(--rg-color-text-primary);
}

.ox-campo__entrada--area {
  height: auto;
  min-height: 84px;
  padding-block: var(--rg-space-3);
  resize: vertical;
  line-height: var(--rg-line-height-base);
}

.ox-campo--travado .ox-campo__caixa {
  background: var(--rg-color-surface-subtle);
  border-color: var(--rg-color-border-subtle);
}

.ox-campo--travado .ox-campo__entrada {
  color: var(--rg-color-text-muted);
  cursor: default;
}

.ox-campo--travado .ox-campo__caixa:focus-within {
  border-color: var(--rg-color-border-subtle);
  box-shadow: none;
}

.ox-campo__dica {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
}
</style>
