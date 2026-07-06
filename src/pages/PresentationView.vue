<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { SLIDES, SCREEN_IMAGES, type Slide } from '@/components/presentation/data';
import CapaSlide from '@/components/presentation/slides/CapaSlide.vue';
import IntroSlide from '@/components/presentation/slides/IntroSlide.vue';
import PerfisSlide from '@/components/presentation/slides/PerfisSlide.vue';
import TimelineSlide from '@/components/presentation/slides/TimelineSlide.vue';
import ScreenSlide from '@/components/presentation/slides/ScreenSlide.vue';
import CoverSlide from '@/components/presentation/slides/CoverSlide.vue';
import HomeSlide from '@/components/presentation/slides/HomeSlide.vue';
import MontageSlide from '@/components/presentation/slides/MontageSlide.vue';
import AgradecimentoSlide from '@/components/presentation/slides/AgradecimentoSlide.vue';

const COMPS: Record<string, any> = {
  capa: CapaSlide, intro: IntroSlide, perfis: PerfisSlide,
  timeline: TimelineSlide, screen: ScreenSlide, cover: CoverSlide,
  home: HomeSlide, montage: MontageSlide, agradecimento: AgradecimentoSlide,
};
const stepsOf = (s: Slide) => ('steps' in s && s.steps ? s.steps : 1);

// ?step=N (1-based) → posição inicial (si, st). Resolvido no setup p/ não disparar transição de entrada.
function resolveStep(g: number): [number, number] {
  let n = Math.max(0, Math.round(g) - 1);
  for (let i = 0; i < SLIDES.length; i++) {
    const steps = stepsOf(SLIDES[i]);
    if (n < steps) return [i, n];
    n -= steps;
  }
  return [SLIDES.length - 1, stepsOf(SLIDES[SLIDES.length - 1]) - 1];
}
const _q = new URLSearchParams(window.location.search);
const _sp = parseInt(_q.get('step') || '', 10);
const [_si0, _st0] = Number.isFinite(_sp) ? resolveStep(_sp) : [0, 0];

const si = ref(_si0); // slide index
const st = ref(_st0); // step within slide
const dir = ref(1); // navigation direction (for transition)

const total = SLIDES.length;
const current = computed(() => SLIDES[si.value]);
const currentProps = computed(() => {
  const s = current.value as any;
  if (s.kind === 'timeline') return { step: st.value };
  if (s.kind === 'cover') return { profile: s.profile, name: s.name, role: s.role };
  if (s.kind === 'montage') return { front: s.front, back: s.back, title: s.title, desc: s.desc, notes: s.notes };
  if (s.kind === 'screen') return { profile: s.profile, image: s.image, title: s.title, desc: s.desc, notes: s.notes, portrait: s.portrait, split: s.split };
  return {};
});
const globalPos = computed(() => {
  let n = 0; for (let i = 0; i < si.value; i++) n += stepsOf(SLIDES[i]); return n + st.value;
});
const globalTotal = computed(() => SLIDES.reduce((a, s) => a + stepsOf(s), 0));

function next() {
  dir.value = 1;
  if (st.value < stepsOf(current.value) - 1) { st.value++; return; }
  if (si.value < total - 1) { si.value++; st.value = 0; }
}
function prev() {
  dir.value = -1;
  if (st.value > 0) { st.value--; return; }
  if (si.value > 0) { si.value--; st.value = stepsOf(SLIDES[si.value]) - 1; }
}
function goStart() { dir.value = -1; si.value = 0; st.value = 0; }
function goEnd() { dir.value = 1; si.value = total - 1; st.value = stepsOf(SLIDES[total - 1]) - 1; }

// Modo export (?export=1): esconde a navegação/dica/barra p/ capturar o slide limpo.
const exportMode = ref(_q.get('export') === '1');

function onKey(e: KeyboardEvent) {
  const k = e.key;
  if (['ArrowRight', ' ', 'PageDown', 'ArrowDown', 'Enter'].includes(k)) { e.preventDefault(); next(); }
  else if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(k)) { e.preventDefault(); prev(); }
  else if (k === 'Home') { e.preventDefault(); goStart(); }
  else if (k === 'End') { e.preventDefault(); goEnd(); }
  else if (k === 'f' || k === 'F') { toggleFs(); }
}

const root = ref<HTMLElement | null>(null);
const isFs = ref(false);
function toggleFs() {
  if (!document.fullscreenElement) root.value?.requestFullscreen?.();
  else document.exitFullscreen?.();
}
function onFsChange() { isFs.value = !!document.fullscreenElement; }

function onStageClick(e: MouseEvent) {
  const w = window.innerWidth;
  if (e.clientX < w * 0.32) prev(); else next();
}

const { width, height } = useWindowSize();
const scale = computed(() => Math.min(width.value / 1920, height.value / 1080));

const showHint = ref(true);
let hintT: number | undefined;
// Mantém as imagens em cache pra que a troca de slide não dê "piscada".
const preloaded: HTMLImageElement[] = [];
onMounted(() => {
  window.addEventListener('keydown', onKey);
  document.addEventListener('fullscreenchange', onFsChange);
  document.documentElement.classList.add('rg-deck-open');
  if (exportMode.value) showHint.value = false;
  else hintT = window.setTimeout(() => (showHint.value = false), 4200);
  // No modo export capturamos um slide por vez — sem preload (evita corrida de imagens).
  if (!exportMode.value) {
    SCREEN_IMAGES.forEach((src) => { const im = new Image(); im.src = src; preloaded.push(im); });
  }
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
  document.removeEventListener('fullscreenchange', onFsChange);
  document.documentElement.classList.remove('rg-deck-open');
  if (hintT) clearTimeout(hintT);
});
</script>

<template>
  <div ref="root" class="deck" :class="{ 'deck--export': exportMode }">
    <div class="deck__viewport" @click="onStageClick">
      <div class="deck__stage" :style="{ transform: `scale(${scale})` }">
        <Transition :name="dir >= 0 ? 'deck-next' : 'deck-prev'" mode="out-in">
          <component :is="COMPS[current.kind]" v-bind="currentProps" :key="si" />
        </Transition>
      </div>
    </div>

    <!-- chrome -->
    <div class="deck__chrome" @click.stop>
      <button class="deck__btn" title="Anterior (←)" @click="prev">‹</button>
      <div class="deck__count">{{ globalPos + 1 }} / {{ globalTotal }}</div>
      <button class="deck__btn" title="Próximo (→)" @click="next">›</button>
      <button class="deck__btn deck__btn--fs" :title="isFs ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'" @click="toggleFs">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <template v-if="!isFs"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></template>
          <template v-else><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></template>
        </svg>
      </button>
    </div>
    <div class="deck__progress"><span :style="{ width: ((globalPos + 1) / globalTotal * 100) + '%' }" /></div>

    <Transition name="fade">
      <div v-if="showHint" class="deck__hint">← → ou clique para navegar · <b>F</b> tela cheia</div>
    </Transition>
  </div>
</template>

<style scoped>
.deck { position: fixed; inset: 0; background: #0b120e; overflow: hidden; }
.deck--export { background: #000; }
.deck--export .deck__chrome, .deck--export .deck__progress, .deck--export .deck__hint { display: none !important; }
.deck__viewport { position: absolute; inset: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.deck__stage {
  position: relative; flex: none;
  width: 1920px; height: 1080px;
  transform-origin: center center;
  border-radius: 2px; overflow: hidden;
  box-shadow: 0 40px 120px rgba(0,0,0,.5);
}

/* slide transitions */
.deck-next-enter-active, .deck-next-leave-active,
.deck-prev-enter-active, .deck-prev-leave-active { transition: opacity .4s ease, transform .4s cubic-bezier(.2,0,0,1); }
.deck-next-enter-from { opacity: 0; transform: translateX(40px); }
.deck-next-leave-to { opacity: 0; transform: translateX(-40px); }
.deck-prev-enter-from { opacity: 0; transform: translateX(-40px); }
.deck-prev-leave-to { opacity: 0; transform: translateX(40px); }

/* chrome */
.deck__chrome {
  position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 10px; z-index: 20;
  padding: 8px 10px; border-radius: 999px;
  background: rgba(255,255,255,.08); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,.14);
  opacity: 0; transition: opacity .3s;
}
.deck:hover .deck__chrome { opacity: 1; }
.deck__btn { width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer; background: rgba(255,255,255,.1); color: #fff; font-size: 22px; line-height: 1; display: flex; align-items: center; justify-content: center; transition: background .2s; }
.deck__btn:hover { background: rgba(255,255,255,.22); }
.deck__count { color: rgba(255,255,255,.85); font-size: 13px; font-weight: 600; min-width: 56px; text-align: center; font-variant-numeric: tabular-nums; }

.deck__progress { position: fixed; left: 0; right: 0; bottom: 0; height: 3px; background: rgba(255,255,255,.1); z-index: 20; }
.deck__progress span { display: block; height: 100%; background: linear-gradient(90deg, #279c50, #46ab68); transition: width .4s cubic-bezier(.2,0,0,1); }

.deck__hint { position: fixed; bottom: 74px; left: 50%; transform: translateX(-50%); z-index: 20; color: rgba(255,255,255,.8); font-size: 14px; background: rgba(0,0,0,.35); padding: 8px 16px; border-radius: 999px; backdrop-filter: blur(8px); }
.deck__hint b { color: #fff; }
.fade-enter-active, .fade-leave-active { transition: opacity .4s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
