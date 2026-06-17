<script setup lang="ts">
import SlideFrame from '../SlideFrame.vue';
import IsoMark from '../IsoMark.vue';
</script>

<template>
  <SlideFrame :watermark="true">
    <div class="ag">
      <IsoMark :size="92" class="anim" style="--d:0s" />
      <h1 class="ag__title anim" style="--d:.1s">Obrigada.</h1>
      <p class="ag__lede anim" style="--d:.2s">Recicla Goiás, a nova plataforma de logística reversa do estado de Goiás.</p>
    </div>
  </SlideFrame>
</template>

<style scoped>
.ag { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; text-align: center; }
.ag__title { margin: 0; font-size: 96px; font-weight: 800; letter-spacing: -.03em; color: var(--rg-primitive-brand-600); line-height: 1; }
.ag__lede { margin: 0; max-width: 900px; font-size: 21px; line-height: 1.55; color: var(--rg-primitive-neutral-600); }
.anim { animation: riseIn .6s cubic-bezier(.2,0,0,1) both; animation-delay: var(--d); }
@keyframes riseIn { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
</style>
