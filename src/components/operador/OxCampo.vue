<script setup lang="ts">
/**
 * Campo de texto do complemento — rótulo em cima, caixa de 44px, raio 8.
 *
 * Réplica do componente `Field` da biblioteca no Figma (borda repouso
 * `--rg-primitive-neutral-500`, o "border/default" que não tem par semântico).
 * `travado` é o `State=locked`: dado que veio do pré-cadastro e não se edita
 * aqui — fica em leitura, com fundo sutil, mas continua legível por leitor de
 * tela (input `readonly`, não `disabled`).
 *
 * Rodada de 16/10: todo campo aberto é obrigatório (asterisco no rótulo). `erro`
 * é a mensagem do campo que a janela de envio mandou preencher (L7); `nota` é o
 * motivo que a análise escreveu, na correção (L3).
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
    erro?: string;
    nota?: string;
    placeholder?: string;
    /** A observação dos documentos é a única que pode ficar em branco. */
    opcional?: boolean;
  }>(),
  { travado: false, dica: undefined, tipo: 'text', multilinha: false, erro: undefined, nota: undefined, placeholder: undefined, opcional: false },
);

const emit = defineEmits<{ (e: 'update:modelValue', valor: string): void }>();

const id = useId();
const descritoPor = computed(
  () =>
    [props.nota ? `${id}-nota` : '', props.erro ? `${id}-erro` : '', props.dica ? `${id}-dica` : '']
      .filter(Boolean)
      .join(' ') || undefined,
);

function aoDigitar(evento: Event) {
  emit('update:modelValue', (evento.target as HTMLInputElement | HTMLTextAreaElement).value);
}
</script>

<template>
  <div class="ox-campo" :class="{ 'ox-campo--travado': travado, 'ox-campo--erro': erro, 'ox-campo--devolvido': nota }">
    <label class="ox-campo__rotulo" :for="id">
      {{ rotulo }}<span v-if="!travado && !opcional" class="ox-campo__obrigatorio" aria-hidden="true"> *</span>
    </label>

    <p v-if="nota" :id="`${id}-nota`" class="ox-campo__nota">
      <v-icon icon="mdi-alert" size="16" aria-hidden="true" />
      <span><strong>Motivo:</strong> {{ nota }}</span>
    </p>

    <div class="ox-campo__caixa">
      <textarea
        v-if="multilinha"
        :id="id"
        class="ox-campo__entrada ox-campo__entrada--area"
        :value="modelValue"
        :readonly="travado"
        :required="!travado && !opcional"
        :aria-invalid="erro ? 'true' : undefined"
        :aria-describedby="descritoPor"
        :placeholder="placeholder"
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
        :required="!travado && !opcional"
        :aria-invalid="erro ? 'true' : undefined"
        :aria-describedby="descritoPor"
        :placeholder="placeholder"
        @input="aoDigitar"
      />
    </div>

    <p v-if="erro" :id="`${id}-erro`" class="ox-campo__erro">{{ erro }}</p>
    <p v-if="dica" :id="`${id}-dica`" class="ox-campo__dica">{{ dica }}</p>
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

.ox-campo__entrada::placeholder {
  color: var(--rg-color-text-muted);
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

.ox-campo--erro .ox-campo__caixa {
  border-color: var(--rg-color-feedback-danger);
}

.ox-campo__erro {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-primitive-red-700);
}

.ox-campo__nota {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-2);
  margin: 0 0 var(--rg-space-1);
  padding: var(--rg-space-2) var(--rg-space-3);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-feedback-danger-soft);
  font-size: var(--rg-font-size-xs);
  line-height: var(--rg-line-height-base);
  color: var(--rg-primitive-red-700);
}

.ox-campo__dica {
  margin: 0;
  font-size: var(--rg-font-size-xs);
  color: var(--rg-color-text-muted);
}
</style>
