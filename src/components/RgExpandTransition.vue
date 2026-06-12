<script setup lang="ts">
/**
 * Transition de expand/collapse com altura REAL (medida no DOM), substituindo
 * o padrão "max-height grande" que corta conteúdos mais altos que o teto.
 *
 * JS-driven (:css="false"): no enter anima height 0 → scrollHeight e limpa o
 * inline style ao final (height volta a auto); no leave anima height atual → 0.
 * Opacity acompanha pra suavizar. Respeita prefers-reduced-motion (corte seco).
 *
 * Uso: <RgExpandTransition><div v-if="open">…</div></RgExpandTransition>
 */

/** Duração da animação de altura (ms) — alinhada ao antigo 320ms do FAQ. */
const HEIGHT_DURATION = 300;
const OPACITY_DURATION = 200;
/** Mesmo cubic-bezier do --rg-motion-ease-emphasized (motion.css). */
const EASE = 'cubic-bezier(0.3, 0, 0, 1)';

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Chama done() ao fim da transição de height, com fallback por timeout
 *  (transitionend pode não disparar se o elemento for removido no meio). */
function afterHeightTransition(el: HTMLElement, done: () => void) {
  let called = false;
  const finish = () => {
    if (called) return;
    called = true;
    el.removeEventListener('transitionend', onEnd);
    done();
  };
  const onEnd = (ev: TransitionEvent) => {
    if (ev.target === el && ev.propertyName === 'height') finish();
  };
  el.addEventListener('transitionend', onEnd);
  window.setTimeout(finish, HEIGHT_DURATION + 80);
}

function onEnter(element: Element, done: () => void) {
  const el = element as HTMLElement;
  if (prefersReducedMotion()) {
    done();
    return;
  }
  el.style.height = '0';
  el.style.opacity = '0';
  el.style.overflow = 'hidden';
  // Reflow força o browser a aplicar o estado inicial antes da transição.
  void el.offsetHeight;
  el.style.transition = `height ${HEIGHT_DURATION}ms ${EASE}, opacity ${OPACITY_DURATION}ms ease`;
  el.style.height = `${el.scrollHeight}px`;
  el.style.opacity = '1';
  afterHeightTransition(el, done);
}

function onAfterEnter(element: Element) {
  const el = element as HTMLElement;
  // Limpa os inline styles — height volta a auto e o conteúdo pode
  // crescer/encolher livremente (ex.: resize da janela).
  el.style.height = '';
  el.style.opacity = '';
  el.style.overflow = '';
  el.style.transition = '';
}

function onLeave(element: Element, done: () => void) {
  const el = element as HTMLElement;
  if (prefersReducedMotion()) {
    done();
    return;
  }
  el.style.height = `${el.scrollHeight}px`;
  el.style.overflow = 'hidden';
  void el.offsetHeight;
  el.style.transition = `height ${HEIGHT_DURATION}ms ${EASE}, opacity ${OPACITY_DURATION}ms ease`;
  el.style.height = '0';
  el.style.opacity = '0';
  afterHeightTransition(el, done);
}
</script>

<template>
  <Transition
    :css="false"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @leave="onLeave"
  >
    <slot />
  </Transition>
</template>
