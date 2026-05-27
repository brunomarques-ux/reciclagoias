<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';

interface Props {
  /** Controla abertura via v-model. */
  modelValue: boolean;
  imageSrc: string;
  imageSrcWebp?: string;
  imageSrc2x?: string;
  alt: string;
  /** Quando true, oferece "duplo clique para zoom". Default true. */
  zoomable?: boolean;
}

const props = withDefaults(defineProps<Props>(), { zoomable: true });
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const zoomed = ref(false);
const pan = ref({ x: 0, y: 0 });
const dragging = ref(false);
const dragStart = ref({ x: 0, y: 0, panX: 0, panY: 0 });

function close() {
  emit('update:modelValue', false);
}

function onOverlayClick(ev: MouseEvent) {
  // Fechar somente se clique direto no overlay (fora da imagem)
  if (ev.target === ev.currentTarget) close();
}

function onImageDblClick() {
  if (!props.zoomable) return;
  zoomed.value = !zoomed.value;
  if (!zoomed.value) pan.value = { x: 0, y: 0 };
}

function onPointerDown(ev: PointerEvent) {
  if (!zoomed.value) return;
  dragging.value = true;
  dragStart.value = {
    x: ev.clientX,
    y: ev.clientY,
    panX: pan.value.x,
    panY: pan.value.y,
  };
  (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
}

function onPointerMove(ev: PointerEvent) {
  if (!dragging.value) return;
  pan.value = {
    x: dragStart.value.panX + (ev.clientX - dragStart.value.x),
    y: dragStart.value.panY + (ev.clientY - dragStart.value.y),
  };
}

function onPointerUp(ev: PointerEvent) {
  dragging.value = false;
  (ev.currentTarget as HTMLElement).releasePointerCapture(ev.pointerId);
}

function onKeyDown(ev: KeyboardEvent) {
  if (!props.modelValue) return;
  if (ev.key === 'Escape') {
    close();
  } else if (ev.key === '+' || ev.key === '=') {
    zoomed.value = true;
  } else if (ev.key === '-' || ev.key === '_') {
    zoomed.value = false;
    pan.value = { x: 0, y: 0 };
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKeyDown);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
      zoomed.value = false;
      pan.value = { x: 0, y: 0 };
    }
  },
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="rg-lightbox">
      <div
        v-if="modelValue"
        class="rg-lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="alt"
        @click="onOverlayClick"
      >
        <button
          type="button"
          class="rg-lightbox__close"
          aria-label="Fechar"
          @click="close"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
          </svg>
        </button>

        <div
          :class="['rg-lightbox__stage', { 'is-zoomed': zoomed, 'is-dragging': dragging }]"
          @click.stop
        >
          <picture
            class="rg-lightbox__media"
            :style="{
              transform: zoomed
                ? `translate(${pan.x}px, ${pan.y}px) scale(2)`
                : 'translate(0, 0) scale(1)',
            }"
            @dblclick="onImageDblClick"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
          >
            <source v-if="imageSrcWebp" :srcset="imageSrcWebp" type="image/webp" />
            <img :src="imageSrc" :alt="alt" draggable="false" />
          </picture>
        </div>

        <p v-if="zoomable" class="rg-lightbox__hint">
          {{ zoomed ? 'Clique duplo para reduzir · arraste para mover · Esc para fechar' : 'Clique duplo para ampliar · Esc para fechar' }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rg-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--rg-space-6);
  background-color: rgba(7, 38, 20, 0.88);
  backdrop-filter: blur(8px);
  cursor: zoom-out;
}

.rg-lightbox__close {
  position: absolute;
  top: var(--rg-space-5);
  right: var(--rg-space-5);
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--rg-radius-pill);
  color: white;
  cursor: pointer;
  transition: background-color var(--rg-motion-duration-fast) var(--rg-motion-ease-standard);
}
.rg-lightbox__close:hover { background-color: rgba(255, 255, 255, 0.2); }
.rg-lightbox__close:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

.rg-lightbox__stage {
  position: relative;
  max-width: 95vw;
  max-height: 90vh;
  overflow: hidden;
  border-radius: var(--rg-radius-xl);
  cursor: zoom-in;
}

.rg-lightbox__stage.is-zoomed { cursor: grab; }
.rg-lightbox__stage.is-dragging { cursor: grabbing; }

.rg-lightbox__media {
  display: block;
  transition: transform var(--rg-motion-duration-base) var(--rg-motion-ease-emphasized);
  user-select: none;
  -webkit-user-drag: none;
}

.rg-lightbox__stage.is-dragging .rg-lightbox__media {
  transition: none;
}

.rg-lightbox__media img {
  display: block;
  max-width: 95vw;
  max-height: 90vh;
  object-fit: contain;
}

.rg-lightbox__hint {
  position: absolute;
  bottom: var(--rg-space-5);
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  padding: var(--rg-space-2) var(--rg-space-4);
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--rg-radius-pill);
  font-size: var(--rg-font-size-xs);
  color: rgba(255, 255, 255, 0.78);
  pointer-events: none;
  white-space: nowrap;
}

/* Transição enter/leave */
.rg-lightbox-enter-active,
.rg-lightbox-leave-active {
  transition: opacity var(--rg-motion-duration-base) var(--rg-motion-ease-standard);
}
.rg-lightbox-enter-from,
.rg-lightbox-leave-to {
  opacity: 0;
}
.rg-lightbox-enter-active .rg-lightbox__stage,
.rg-lightbox-leave-active .rg-lightbox__stage {
  transition: transform var(--rg-motion-duration-slow) var(--rg-motion-ease-emphasized);
}
.rg-lightbox-enter-from .rg-lightbox__stage,
.rg-lightbox-leave-to .rg-lightbox__stage {
  transform: scale(0.92);
}
</style>
