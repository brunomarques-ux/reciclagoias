<script setup lang="ts">
/**
 * Janela modal das telas do Admin (documento, mensagem ao operador, aprovação).
 *
 * Figma: `Recicla Goiás - Figma`, seção do Admin (5901:10683), L3·2 (PdfPreview),
 * L2·2 (mensagem) e L4·3 (confirmar aprovação). Abre com o foco no primeiro
 * controle, prende o Tab dentro, fecha com Esc e no clique no véu, e devolve o
 * foco a quem abriu.
 */
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue';

withDefaults(
  defineProps<{
    titulo: string;
    /** Ícone antes do título (o clipe na janela do documento). */
    icone?: string;
    largura?: number;
    /** Janela do documento: sem padding, topo e rodapé com divisória. */
    documento?: boolean;
  }>(),
  { icone: undefined, largura: 760, documento: false },
);
const emit = defineEmits<{ (e: 'fechar'): void }>();

const janela = ref<HTMLElement | null>(null);
const idTitulo = `ax-janela-${Math.random().toString(36).slice(2, 8)}`;
let quemAbriu: HTMLElement | null = null;

const FOCAVEIS = 'button:not([disabled]), [href], textarea, input, select, [tabindex]:not([tabindex="-1"])';

function teclas(ev: KeyboardEvent) {
  if (ev.key === 'Escape') {
    ev.stopPropagation();
    emit('fechar');
    return;
  }
  if (ev.key !== 'Tab' || !janela.value) return;
  const lista = [...janela.value.querySelectorAll<HTMLElement>(FOCAVEIS)];
  if (!lista.length) return;
  const primeiro = lista[0]!;
  const ultimo = lista[lista.length - 1]!;
  if (ev.shiftKey && document.activeElement === primeiro) {
    ev.preventDefault();
    ultimo.focus();
  } else if (!ev.shiftKey && document.activeElement === ultimo) {
    ev.preventDefault();
    primeiro.focus();
  }
}

onMounted(() => {
  quemAbriu = document.activeElement as HTMLElement | null;
  void nextTick(() => {
    const alvo = janela.value?.querySelector<HTMLElement>('[data-foco-inicial]') ?? janela.value?.querySelector<HTMLElement>(FOCAVEIS);
    alvo?.focus();
  });
});
onBeforeUnmount(() => quemAbriu?.focus?.());
</script>

<template>
  <div class="ax-veu" @click.self="emit('fechar')">
    <div
      ref="janela"
      class="ax-janela"
      :class="{ 'ax-janela--documento': documento }"
      :style="{ width: `min(${largura}px, calc(100vw - 32px))` }"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="idTitulo"
      @keydown="teclas"
    >
      <header class="ax-janela__topo">
        <h2 :id="idTitulo" class="ax-janela__titulo" :class="{ 'ax-janela__titulo--doc': documento }">
          <v-icon v-if="icone" :icon="icone" size="16" aria-hidden="true" />
          {{ titulo }}
        </h2>
        <button type="button" class="ax-janela__x" aria-label="Fechar" @click="emit('fechar')">
          <v-icon icon="mdi-close" size="20" aria-hidden="true" />
        </button>
      </header>
      <div class="ax-janela__corpo">
        <slot />
      </div>
      <footer class="ax-janela__acoes">
        <slot name="acoes" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.ax-veu {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: start center;
  overflow-y: auto;
  padding: 10vh var(--rg-space-4) var(--rg-space-8);
  background: color-mix(in srgb, var(--rg-primitive-neutral-900) 55%, transparent);
}

.ax-janela {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-4);
  padding: var(--rg-space-6);
  border-radius: var(--rg-radius-lg);
  background: var(--rg-color-surface-raised);
  box-shadow: var(--rg-elevation-4);
}

.ax-janela--documento {
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.ax-janela__topo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--rg-space-4);
}

.ax-janela--documento .ax-janela__topo {
  align-items: center;
  padding: var(--rg-space-4) var(--rg-space-6);
  border-bottom: 1px solid var(--rg-color-border-subtle);
}

.ax-janela__titulo {
  display: flex;
  align-items: center;
  gap: var(--rg-space-2);
  margin: 0;
  font-size: var(--rg-font-size-lg);
  font-weight: var(--rg-font-weight-bold);
  line-height: 24px;
  color: var(--rg-color-text-primary);
}

.ax-janela__titulo--doc {
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-semibold);
  line-height: 20px;
}

.ax-janela__x {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.ax-janela__x:hover {
  background: var(--rg-color-surface-subtle);
}

.ax-janela__x:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ax-janela__corpo {
  display: flex;
  flex-direction: column;
  gap: var(--rg-space-3);
}

.ax-janela__acoes {
  display: flex;
  justify-content: flex-end;
  gap: var(--rg-space-3);
}

.ax-janela--documento .ax-janela__acoes {
  padding: var(--rg-space-4) var(--rg-space-6);
  border-top: 1px solid var(--rg-color-border-subtle);
}
</style>
