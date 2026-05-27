<script setup lang="ts">
/**
 * Texto inline com gradient de fundo que cresce da esquerda pra direita
 * (animação tipo "marca-texto" passando). Adaptado do Aceternity Highlight
 * para a identidade Recicla Goiás (gradient verde brand).
 *
 * Anima quando entra no viewport pela primeira vez (IntersectionObserver).
 */
import { ref, onMounted, onBeforeUnmount } from 'vue';

interface Props {
  /** Atraso em ms antes de iniciar a animação após visível. */
  delay?: number;
  /** Duração da animação em ms. */
  duration?: number;
}
const props = withDefaults(defineProps<Props>(), {
  delay: 400,
  duration: 1600,
});

const el = ref<HTMLElement | null>(null);
const animating = ref(false);
let observer: IntersectionObserver | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    animating.value = true;
    return;
  }

  if (!el.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting) {
        timer = setTimeout(() => {
          animating.value = true;
        }, props.delay);
        observer?.disconnect();
      }
    },
    { threshold: 0.4 },
  );
  observer.observe(el.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <span
    ref="el"
    :class="['rg-highlight', { 'is-animating': animating }]"
    :style="{ '--rg-highlight-duration': duration + 'ms' } as Record<string, string>"
  >
    <slot />
  </span>
</template>

<style scoped>
.rg-highlight {
  display: inline;
  background-image: linear-gradient(
    90deg,
    var(--rg-primitive-brand-400) 0%,
    var(--rg-primitive-brand-600) 100%
  );
  background-repeat: no-repeat;
  background-position: left center;
  background-size: 0% 100%;
  padding: 0.06em 0.18em;
  border-radius: 0.32em;
  transition: background-size var(--rg-highlight-duration, 1600ms) cubic-bezier(0.65, 0, 0.35, 1);
  color: white;
  /* Mantém o texto legível mesmo no início (sem highlight). */
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}

.rg-highlight.is-animating {
  background-size: 100% 100%;
}
</style>
