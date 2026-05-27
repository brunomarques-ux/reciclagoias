<script setup lang="ts">
/**
 * Versão Vue do componente HeroHighlight (Aceternity/v0).
 * Adapta para a identidade Recicla Goiás:
 *  - background herda do container (mantém o verde brand-950 do hero)
 *  - dot pattern padrão em brand-700 (sutil sobre verde escuro)
 *  - dot pattern revelado pelo cursor em brand-300 (verde claro)
 *  - máscara radial 200px segue o mouse, criando a "lanterna" de iluminação
 */
import { ref } from 'vue';

const container = ref<HTMLElement | null>(null);
const mx = ref(0);
const my = ref(0);

function onMouseMove(ev: MouseEvent) {
  const el = container.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  mx.value = ev.clientX - rect.left;
  my.value = ev.clientY - rect.top;
}
</script>

<template>
  <div
    ref="container"
    class="rg-hero-highlight"
    @mousemove="onMouseMove"
  >
    <!-- Camada base com dots verdes sutis -->
    <div class="rg-hero-highlight__dots" aria-hidden="true" />

    <!-- Camada de revelação que segue o mouse -->
    <div
      class="rg-hero-highlight__dots-hover"
      aria-hidden="true"
      :style="{
        '--mx': mx + 'px',
        '--my': my + 'px',
      } as Record<string, string>"
    />

    <div class="rg-hero-highlight__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.rg-hero-highlight {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  isolation: isolate;
}

.rg-hero-highlight__dots,
.rg-hero-highlight__dots-hover {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(
    circle,
    var(--rg-primitive-brand-500) 1.2px,
    transparent 1.2px
  );
  background-size: 20px 20px;
}

.rg-hero-highlight__dots {
  opacity: 0.32;
}

.rg-hero-highlight__dots-hover {
  background-image: radial-gradient(
    circle,
    var(--rg-primitive-brand-300) 1.6px,
    transparent 1.6px
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  /* Máscara radial 200px de raio segue o ponteiro do mouse,
     revelando dots claros como uma lanterna. */
  -webkit-mask-image: radial-gradient(
    220px circle at var(--mx, 50%) var(--my, 50%),
    black 0%,
    transparent 100%
  );
  mask-image: radial-gradient(
    220px circle at var(--mx, 50%) var(--my, 50%),
    black 0%,
    transparent 100%
  );
}

/* Ao passar o mouse sobre o container, ativa a "lanterna". */
.rg-hero-highlight:hover .rg-hero-highlight__dots-hover {
  opacity: 1;
}

.rg-hero-highlight__content {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* prefers-reduced-motion: mantém os dots estáticos mas remove a lanterna */
@media (prefers-reduced-motion: reduce) {
  .rg-hero-highlight__dots-hover { display: none; }
}
</style>
