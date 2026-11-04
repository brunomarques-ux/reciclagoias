<script setup lang="ts">
/**
 * Botão de ícone "editar" com tooltip, do bloco de observação ou motivo salvo.
 *
 * Figma: `Recicla Goiás - Figma`, seção do Admin (5901:10683), L6·1 (tooltip
 * "Editar motivo" sobre o lápis). O tooltip abre no hover e no foco, continua
 * aberto enquanto o ponteiro está sobre ele e fecha com Esc (WCAG 1.4.13). O nome
 * acessível vem do `aria-label`, mais completo que o tooltip (diz qual item).
 */
import { onBeforeUnmount, ref, watch } from 'vue';

defineProps<{
  /** Texto curto do tooltip: "Editar motivo", "Editar observação". */
  rotulo: string;
  /** Nome acessível completo: "Editar motivo de Alvará de funcionamento". */
  nome: string;
}>();
defineEmits<{ (e: 'click'): void }>();

const aberto = ref(false);
const botao = ref<HTMLButtonElement | null>(null);

function fecharNoEsc(ev: KeyboardEvent) {
  if (ev.key === 'Escape') aberto.value = false;
}
watch(aberto, (v) => {
  if (v) window.addEventListener('keydown', fecharNoEsc);
  else window.removeEventListener('keydown', fecharNoEsc);
});
onBeforeUnmount(() => window.removeEventListener('keydown', fecharNoEsc));

defineExpose({ focus: () => botao.value?.focus() });
</script>

<template>
  <span class="ax-editar" @mouseenter="aberto = true" @mouseleave="aberto = false">
    <button
      ref="botao"
      type="button"
      class="ax-editar__botao"
      :aria-label="nome"
      @focus="aberto = true"
      @blur="aberto = false"
      @click="$emit('click')"
    >
      <v-icon icon="mdi-pencil" size="16" aria-hidden="true" />
    </button>
    <span v-show="aberto" class="ax-editar__dica" role="tooltip" aria-hidden="true">{{ rotulo }}</span>
  </span>
</template>

<style scoped>
.ax-editar {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.ax-editar__botao {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: var(--rg-radius-sm);
  background: none;
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.ax-editar__botao:hover {
  background: var(--rg-color-surface-raised);
  border-color: var(--rg-color-border-base);
  color: var(--rg-color-text-brand);
}

.ax-editar__botao:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ax-editar__dica {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  z-index: 5;
  transform: translateX(-50%);
  padding: var(--rg-space-1) var(--rg-space-2);
  border-radius: var(--rg-radius-sm);
  background: var(--rg-primitive-neutral-900);
  color: var(--rg-primitive-neutral-0);
  font-size: var(--rg-font-size-xs);
  font-weight: var(--rg-font-weight-medium);
  line-height: 16px;
  white-space: nowrap;
}

/* ponte invisível entre o botão e o tooltip: o ponteiro passa sem fechá-lo */
.ax-editar__dica::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 6px;
}
</style>
