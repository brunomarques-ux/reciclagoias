<script setup lang="ts">
/**
 * Versão Vue do componente HeroHighlight (Aceternity/v0).
 * Adapta para a identidade Recicla Goiás:
 *  - background herda do container (mantém o verde brand-950 do hero)
 *  - dot pattern padrão em brand-200 com opacity 0.03 (quase imperceptível, foco na leitura)
 *  - dot pattern revelado pelo cursor em brand-50 (quase branco)
 *  - máscara radial 260px segue o mouse, criando a "lanterna" sutil (opacity 0.2 no hover)
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
  /* IMPORTANTE: usar PORCENTAGENS no radial-gradient (não pixels absolutos)
     senão a transição de cor→transparent acontece em distância zero e os
     dots não renderizam visualmente. 12% de 24px ≈ 3px de raio de dot. */
  background-image: radial-gradient(
    circle at center,
    var(--rg-primitive-brand-200) 12%,
    transparent 15%
  );
  background-size: 24px 24px;
  background-repeat: repeat;
}

.rg-hero-highlight__dots {
  /* Opacidade BAIXÍSSIMA (0.03): o pattern é praticamente imperceptível
     sem hover. O foco é a leitura do background — a lanterna do mouse é que
     dá o destaque pontual. */
  opacity: 0.03;
}

.rg-hero-highlight__dots-hover {
  background-image: radial-gradient(
    circle at center,
    var(--rg-primitive-brand-50) 14%,
    transparent 18%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  /* Máscara radial 260px de raio segue o ponteiro do mouse,
     revelando dots quase-brancos como uma lanterna. */
  -webkit-mask-image: radial-gradient(
    260px circle at var(--mx, 50%) var(--my, 50%),
    black 0%,
    transparent 100%
  );
  mask-image: radial-gradient(
    260px circle at var(--mx, 50%) var(--my, 50%),
    black 0%,
    transparent 100%
  );
}

/* Ao passar o mouse sobre o container, ativa a "lanterna".
   Opacity 0.2 = leve destaque pontual sem competir com o conteúdo
   nem com a leitura do background verde. */
.rg-hero-highlight:hover .rg-hero-highlight__dots-hover {
  opacity: 0.2;
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
