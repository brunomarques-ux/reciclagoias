<script setup lang="ts">
/**
 * Barra de progresso de scroll fixa no topo da página, logo abaixo da
 * navbar glass. Cresce horizontalmente conforme o usuário rola a página.
 *
 * Adaptação Vue do componente React "scroll-progress" — em vez de motion/react
 * com useScroll + useSpring, usamos um scroll listener throttled via rAF
 * que atualiza um CSS custom property `--rg-scroll-progress` (0..1). O CSS
 * faz o scaleX direto. Sem nova dependência.
 *
 * O easing "spring" do componente original é simulado com transition CSS
 * curta (90ms) — suficiente pra suavizar o frame-to-frame sem ficar laggy.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';

const progress = ref(0);
let rafId: number | null = null;

function updateProgress() {
  rafId = null;
  const scrollTop =
    window.scrollY || document.documentElement.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
  progress.value = Math.max(0, Math.min(1, ratio));
}

function onScroll() {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(updateProgress);
}

onMounted(() => {
  updateProgress();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', updateProgress);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div
    class="rg-scroll-progress"
    role="progressbar"
    aria-label="Progresso de leitura da página"
    :aria-valuenow="Math.round(progress * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-hidden="true"
  >
    <div
      class="rg-scroll-progress__bar"
      :style="{ '--rg-scroll-progress': progress } as Record<string, string | number>"
    />
  </div>
</template>

<style scoped>
.rg-scroll-progress {
  position: fixed;
  /* Cola logo abaixo da navbar glass (que tem altura ~52px). z-index 29 fica
     ATRÁS do header (30) pra não ser coberto pelo blur do glass mas também
     não sobrepor menus dropdown que viessem do header. */
  top: 52px;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 29;
  pointer-events: none;
  /* Trilho sutil verde-acinzentado (versão "vazia" da barra). */
  background-color: rgba(31, 131, 68, 0.08);
}

.rg-scroll-progress__bar {
  width: 100%;
  height: 100%;
  /* Gradient verde brand com brilho — termina com leve glow no fim da
     barra pra dar sensação de progresso "vivo". */
  background: linear-gradient(
    90deg,
    var(--rg-primitive-brand-600) 0%,
    var(--rg-primitive-brand-500) 60%,
    var(--rg-primitive-brand-400) 100%
  );
  box-shadow:
    0 0 8px rgba(31, 131, 68, 0.55),
    0 0 16px rgba(31, 131, 68, 0.32);
  transform: scaleX(var(--rg-scroll-progress, 0));
  transform-origin: left center;
  /* Transition curta (90ms) suaviza atualizações entre frames do rAF sem
     parecer atrasado. */
  transition: transform 90ms linear;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  .rg-scroll-progress__bar {
    transition: none;
  }
}
</style>
