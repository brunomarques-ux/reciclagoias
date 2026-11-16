<script setup lang="ts">
/**
 * Na correção, o problema que a análise apontou no bloco inteiro (PROPOSTA de
 * 13/11/2026 para a SEMAD: conferência só em Documentos, com "Apontar problema"
 * por bloco). Aparece no topo da etapa, e a etapa inteira abre para edição.
 *
 * Não tem frame no Figma: a linha L4 só desenha o lado do Admin. Segue a nota de
 * motivo que o campo e o documento devolvidos já usam.
 */
import { computed } from 'vue';

import { useComplementoStore } from '@/stores/complemento';

const props = defineProps<{ etapa: number }>();
const complemento = useComplementoStore();
const motivo = computed(() => (complemento.emCorrecao ? complemento.devolvidos[`etapa-${props.etapa}`] : undefined));
</script>

<template>
  <p v-if="motivo" class="ox-nota-etapa" role="note">
    <v-icon icon="mdi-alert" size="16" aria-hidden="true" />
    <span><strong>Motivo:</strong> {{ motivo }}</span>
  </p>
</template>

<style scoped>
.ox-nota-etapa {
  display: flex;
  align-items: flex-start;
  gap: var(--rg-space-2);
  margin: 0;
  padding: var(--rg-space-3) var(--rg-space-4);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-feedback-danger-soft);
  color: var(--rg-primitive-red-700);
  font-size: var(--rg-font-size-sm);
  line-height: var(--rg-line-height-base);
}
</style>
