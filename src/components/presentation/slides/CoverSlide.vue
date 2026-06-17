<script setup lang="ts">
import { computed } from 'vue';
import SlideFrame from '../SlideFrame.vue';
import { PROFILES, type ProfileKey } from '../data';

const props = defineProps<{ profile: ProfileKey; name: string; role: string }>();
const p = computed(() => PROFILES[props.profile]);
</script>

<template>
  <SlideFrame :foot-right="'TELAS · ' + p.label">
    <svg class="cover__wm" viewBox="0 0 24 24" v-html="p.icon" />
    <div class="cover">
      <span class="cover__sq anim-pop" style="--d:0s"><svg viewBox="0 0 24 24" v-html="p.icon" /></span>
      <span class="cover__pill anim" style="--d:.16s"><span class="cover__dot" />TELAS DO PERFIL</span>
      <h1 class="cover__name anim" style="--d:.24s">{{ name }}</h1>
      <p class="cover__role anim" style="--d:.34s">{{ role }}</p>
    </div>
  </SlideFrame>
</template>

<style scoped>
.cover { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; text-align: center; }
.cover__wm { position: absolute; right: 80px; bottom: 30px; width: 460px; height: 460px; fill: none; stroke: var(--rg-primitive-brand-200); stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; opacity: 0; animation: wmIn 1s .1s ease-out both; z-index: 0; }
.cover__sq {
  width: 108px; height: 108px; border-radius: 28px; display: flex; align-items: center; justify-content: center;
  background: var(--rg-primitive-brand-50); border: 1.5px solid var(--rg-primitive-brand-100);
  box-shadow: 0 14px 32px rgba(15,23,42,.10);
}
.cover__sq svg { width: 54px; height: 54px; fill: none; stroke: var(--rg-primitive-brand-600); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.cover__pill { display: inline-flex; align-items: center; gap: 10px; padding: 9px 20px; background: #fff; border: 1px solid var(--rg-primitive-neutral-200); border-radius: 999px; box-shadow: 0 2px 8px rgba(15,23,42,.06); font-size: 13px; font-weight: 700; letter-spacing: .08em; color: var(--rg-primitive-brand-700); }
.cover__dot { width: 8px; height: 8px; border-radius: 50%; background: var(--rg-primitive-brand-500); }
.cover__name { margin: 0; font-size: 80px; font-weight: 800; line-height: 1.0; letter-spacing: -.025em; color: var(--rg-primitive-neutral-900); }
.cover__role { margin: 0; max-width: 900px; font-size: 21px; line-height: 1.55; color: var(--rg-primitive-neutral-600); }

.anim { animation: riseIn .6s cubic-bezier(.2,0,0,1) both; animation-delay: var(--d); }
.anim-pop { animation: popIn .6s cubic-bezier(.34,1.56,.64,1) both; animation-delay: var(--d); }
@keyframes riseIn { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: none; } }
@keyframes popIn { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: scale(1); } }
@keyframes wmIn { from { opacity: 0; transform: translateX(40px) rotate(-6deg); } to { opacity: .06; transform: none; } }
</style>
