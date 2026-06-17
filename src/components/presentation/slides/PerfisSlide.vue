<script setup lang="ts">
import SlideFrame from '../SlideFrame.vue';
import { PERFIS } from '../data';
</script>

<template>
  <SlideFrame foot-right="PERFIS DO SISTEMA">
    <div class="perfis">
      <div class="perfis__head">
        <span class="perfis__eyebrow anim" style="--d:0s">QUEM USA O SISTEMA</span>
        <h2 class="perfis__title anim" style="--d:.06s">Quatro perfis de <span class="perfis__accent">acesso</span></h2>
        <p class="perfis__lede anim" style="--d:.12s">Cada perfil enxerga e opera apenas o que é da sua responsabilidade dentro do sistema.</p>
      </div>
      <div class="perfis__row">
        <div
          v-for="(p, i) in PERFIS"
          :key="p.name"
          class="perfis__card anim-card"
          :style="{ '--d': 0.28 + i * 0.13 + 's' }"
        >
          <span class="perfis__ic"><svg viewBox="0 0 24 24" v-html="p.icon" /></span>
          <h3 class="perfis__name">{{ p.name }}</h3>
          <p class="perfis__role">{{ p.role }}</p>
        </div>
      </div>
    </div>
  </SlideFrame>
</template>

<style scoped>
.perfis { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 44px; }
.perfis__head { display: flex; flex-direction: column; gap: 14px; align-items: flex-start; }
.perfis__eyebrow { font-size: 14px; font-weight: 700; letter-spacing: .06em; color: var(--rg-primitive-brand-600); }
.perfis__title { margin: 0; font-size: 58px; font-weight: 700; letter-spacing: -.02em; color: var(--rg-primitive-neutral-900); }
.perfis__accent { color: var(--rg-primitive-brand-600); }
.perfis__lede { margin: 0; font-size: 19px; line-height: 1.55; color: var(--rg-primitive-neutral-600); max-width: 900px; }

.perfis__row { display: flex; gap: 24px; }
.perfis__card {
  flex: 1; display: flex; flex-direction: column; gap: 18px;
  padding: 30px 28px; border-radius: 22px;
  background: #fff; border: 1px solid var(--rg-primitive-neutral-200);
  box-shadow: 0 18px 40px rgba(15,23,42,.10), 0 4px 12px rgba(15,23,42,.05);
}
.perfis__ic {
  width: 60px; height: 60px; border-radius: 16px;
  background: var(--rg-primitive-brand-50); border: 1px solid var(--rg-primitive-brand-100);
  display: flex; align-items: center; justify-content: center;
}
.perfis__ic svg { width: 30px; height: 30px; fill: none; stroke: var(--rg-primitive-brand-600); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.perfis__name { margin: 0; font-size: 22px; font-weight: 700; color: var(--rg-primitive-neutral-900); }
.perfis__role { margin: 0; font-size: 16px; line-height: 1.5; color: var(--rg-primitive-neutral-600); }

.anim { animation: riseIn .55s cubic-bezier(.2,0,0,1) both; animation-delay: var(--d); }
.anim-card { animation: cardIn .6s cubic-bezier(.2,0,0,1) both; animation-delay: var(--d); }
@keyframes riseIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes cardIn { from { opacity: 0; transform: translateY(26px) scale(.97); } to { opacity: 1; transform: none; } }
</style>
