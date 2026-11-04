<script setup lang="ts">
/**
 * Menu da linha da fila de cadastros (os três pontos no fim da linha).
 *
 * Figma: `Recicla Goiás - Figma`, seção do Admin (5901:10683), L1·1 ("menu da
 * linha · aberto": Visualizar e Analisar). Botão com `aria-haspopup` e
 * `aria-expanded`; abre com o foco no primeiro item, setas navegam, fecha com Esc
 * (devolvendo o foco ao botão), com Tab e com clique fora.
 */
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

import type { ItemMenu } from './analise';

defineProps<{
  /** Nome acessível do botão: "Ações de Cooperativa X". */
  rotulo: string;
  itens: ItemMenu[];
}>();
const emit = defineEmits<{ (e: 'escolher', id: string): void }>();

const aberto = ref(false);
const raiz = ref<HTMLElement | null>(null);
const gatilho = ref<HTMLButtonElement | null>(null);
const lista = ref<HTMLElement | null>(null);
const idMenu = `ax-menu-${Math.random().toString(36).slice(2, 8)}`;

const itensFocaveis = () => [...(lista.value?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? [])];

function abrir() {
  aberto.value = true;
  void nextTick(() => itensFocaveis()[0]?.focus());
}

function fechar(devolverFoco = true) {
  aberto.value = false;
  if (devolverFoco) gatilho.value?.focus();
}

function alternar() {
  if (aberto.value) fechar();
  else abrir();
}

function escolher(item: ItemMenu) {
  if (item.desabilitado) return;
  fechar(false);
  emit('escolher', item.id);
}

function teclas(ev: KeyboardEvent) {
  const todos = itensFocaveis();
  const atual = todos.indexOf(document.activeElement as HTMLButtonElement);
  if (ev.key === 'Escape') {
    ev.preventDefault();
    fechar();
  } else if (ev.key === 'ArrowDown') {
    ev.preventDefault();
    todos[(atual + 1) % todos.length]?.focus();
  } else if (ev.key === 'ArrowUp') {
    ev.preventDefault();
    todos[(atual - 1 + todos.length) % todos.length]?.focus();
  } else if (ev.key === 'Home') {
    ev.preventDefault();
    todos[0]?.focus();
  } else if (ev.key === 'End') {
    ev.preventDefault();
    todos[todos.length - 1]?.focus();
  } else if (ev.key === 'Tab') {
    fechar(false);
  }
}

function cliqueFora(ev: PointerEvent) {
  if (raiz.value && !raiz.value.contains(ev.target as Node)) fechar(false);
}

watch(aberto, (v) => {
  if (v) document.addEventListener('pointerdown', cliqueFora);
  else document.removeEventListener('pointerdown', cliqueFora);
});
onBeforeUnmount(() => document.removeEventListener('pointerdown', cliqueFora));
</script>

<template>
  <div ref="raiz" class="ax-menu">
    <button
      ref="gatilho"
      type="button"
      class="ax-menu__gatilho"
      aria-haspopup="menu"
      :aria-expanded="aberto"
      :aria-controls="aberto ? idMenu : undefined"
      :aria-label="rotulo"
      @click="alternar"
      @keydown.down.prevent="abrir"
    >
      <v-icon icon="mdi-dots-vertical" size="20" aria-hidden="true" />
    </button>
    <ul v-if="aberto" :id="idMenu" ref="lista" class="ax-menu__lista" role="menu" :aria-label="rotulo" @keydown="teclas">
      <li v-for="item in itens" :key="item.id" role="none">
        <button
          type="button"
          role="menuitem"
          tabindex="-1"
          class="ax-menu__item"
          :class="{ 'ax-menu__item--destaque': item.destaque }"
          :disabled="item.desabilitado"
          @click="escolher(item)"
        >
          {{ item.rotulo }}
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ax-menu {
  position: relative;
  display: inline-flex;
}

.ax-menu__gatilho {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--rg-radius-sm);
  background: none;
  color: var(--rg-color-text-secondary);
  cursor: pointer;
}

.ax-menu__gatilho:hover,
.ax-menu__gatilho[aria-expanded='true'] {
  background: var(--rg-color-surface-subtle);
  color: var(--rg-color-text-primary);
}

.ax-menu__gatilho:focus-visible {
  outline: 2px solid var(--rg-color-action-primary);
  outline-offset: 2px;
}

.ax-menu__lista {
  position: absolute;
  top: calc(100% + var(--rg-space-1));
  right: 0;
  z-index: 10;
  width: 180px;
  margin: 0;
  padding: 6px 0;
  list-style: none;
  border: 1px solid var(--rg-color-border-subtle);
  border-radius: var(--rg-radius-md);
  background: var(--rg-color-surface-raised);
  box-shadow: var(--rg-elevation-3);
}

.ax-menu__item {
  display: block;
  width: 100%;
  padding: 10px var(--rg-space-4);
  border: none;
  background: none;
  font: inherit;
  font-size: var(--rg-font-size-sm);
  font-weight: var(--rg-font-weight-medium);
  line-height: 20px;
  color: var(--rg-color-text-primary);
  text-align: left;
  cursor: pointer;
}

.ax-menu__item:hover:not(:disabled),
.ax-menu__item:focus-visible {
  outline: none;
  background: var(--rg-color-surface-subtle);
}

.ax-menu__item--destaque {
  color: var(--rg-color-text-brand);
}

.ax-menu__item--destaque:hover:not(:disabled),
.ax-menu__item--destaque:focus-visible {
  background: var(--rg-color-surface-brand);
}

.ax-menu__item:disabled {
  color: var(--rg-color-text-disabled);
  cursor: default;
}
</style>
