<script setup lang="ts">
import SlideFrame from '../SlideFrame.vue';
import ScreenCaption from '../ScreenCaption.vue';

// Chip globo (Lucide)
const GLOBE = '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>';
</script>

<template>
  <SlideFrame foot-right="SITE OFICIAL">
    <div class="home">
      <ScreenCaption
        class="home__cap"
        chip="SITE OFICIAL"
        :icon="GLOBE"
        title="Página inicial"
        desc="A home pública do Recicla Goiás, no ar."
        :notes="['Passe o mouse e role para navegar pela página inteira.']"
      />

      <!-- mockup de navegador com a landing ao vivo (rolável) -->
      <div class="home__browser" @click.stop>
        <div class="home__bar">
          <span class="home__dots"><i /><i /><i /></span>
          <span class="home__url">
            <svg viewBox="0 0 24 24" class="home__lock"><path d="M5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            reciclagoias.vercel.app
          </span>
        </div>
        <div class="home__viewport">
          <iframe class="home__frame" src="/" title="Recicla Goiás — página inicial" loading="lazy" />
        </div>
      </div>
    </div>
  </SlideFrame>
</template>

<style scoped>
.home { flex: 1; display: flex; align-items: center; justify-content: center; gap: 64px; width: 100%; }
.home__cap { flex: none; animation: capCorner .55s .18s cubic-bezier(.2,0,0,1) both; }

.home__browser {
  flex: 1; min-width: 0; max-width: 1180px; height: 832px;
  display: flex; flex-direction: column;
  border-radius: 16px; overflow: hidden; background: #fff;
  border: 1px solid var(--rg-primitive-neutral-200);
  box-shadow: 0 34px 80px rgba(15,23,42,.22), 0 10px 26px rgba(15,23,42,.10);
  animation: shotIn .6s cubic-bezier(.2,0,0,1) both;
}
.home__bar {
  flex: none; height: 46px; display: flex; align-items: center; gap: 16px; padding: 0 18px;
  background: #f1f5f3; border-bottom: 1px solid var(--rg-primitive-neutral-200);
}
.home__dots { display: inline-flex; gap: 7px; }
.home__dots i { width: 11px; height: 11px; border-radius: 50%; background: #d3dcd6; }
.home__dots i:nth-child(1) { background: #f0a8a0; }
.home__dots i:nth-child(2) { background: #f1d29a; }
.home__dots i:nth-child(3) { background: #a7d8b0; }
.home__url {
  flex: 1; display: inline-flex; align-items: center; gap: 8px;
  height: 28px; padding: 0 14px; border-radius: 999px; background: #fff;
  border: 1px solid var(--rg-primitive-neutral-200);
  font-size: 13px; font-weight: 600; color: var(--rg-primitive-neutral-600); max-width: 460px;
}
.home__lock { width: 13px; height: 13px; fill: none; stroke: var(--rg-primitive-brand-600); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.home__viewport { flex: 1; min-height: 0; background: #fff; }
.home__frame { width: 100%; height: 100%; border: 0; display: block; }

@keyframes shotIn { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes capCorner { from { opacity: 0; transform: translateX(-22px); } to { opacity: 1; transform: none; } }
</style>
