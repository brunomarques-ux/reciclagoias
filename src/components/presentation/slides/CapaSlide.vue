<script setup lang="ts">
import SlideFrame from '../SlideFrame.vue';
import IsoMark from '../IsoMark.vue';
</script>

<template>
  <SlideFrame foot-right="Apresentação institucional · Junho 2026">
    <div class="capa">
      <IsoMark :size="96" class="capa__iso anim" style="--d: 0s" />
      <span class="capa__pill anim" style="--d: .08s"><span class="capa__dot" />APRESENTAÇÃO DO SISTEMA</span>
      <h1 class="capa__title anim" style="--d: .16s">O sistema<br /><span class="capa__accent">Recicla Goiás</span></h1>
      <p class="capa__lede anim" style="--d: .26s">A nova plataforma de logística reversa do estado de Goiás, uma evolução completa do antigo SISRev.</p>
    </div>
  </SlideFrame>
</template>

<style scoped>
.capa { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; text-align: center; }
.capa__pill {
  display: inline-flex; align-items: center; gap: 10px; padding: 9px 20px;
  background: #fff; border: 1px solid var(--rg-primitive-neutral-200); border-radius: 999px;
  box-shadow: 0 2px 8px rgba(15,23,42,.06);
  font-size: 13px; font-weight: 700; letter-spacing: .08em; color: var(--rg-primitive-brand-700);
}
.capa__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--rg-primitive-brand-500); }
.capa__title { margin: 0; font-size: 88px; font-weight: 800; line-height: .98; letter-spacing: -.025em; color: var(--rg-primitive-neutral-900); }
.capa__accent { color: var(--rg-primitive-brand-600); }
.capa__lede { margin: 0; max-width: 900px; font-size: 21px; line-height: 1.58; color: var(--rg-primitive-neutral-600); }

.anim { animation: riseIn .6s cubic-bezier(.2,0,0,1) both; animation-delay: var(--d); }
@keyframes riseIn { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
</style>
