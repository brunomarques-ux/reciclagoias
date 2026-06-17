<script setup lang="ts">
import { computed } from 'vue';
import SlideFrame from '../SlideFrame.vue';
import { PROFILES, type ProfileKey } from '../data';

interface Props {
  profile: ProfileKey;
  image: string;
  title: string;
  desc: string;
  notes?: string[];
  portrait?: boolean;
}
const props = withDefaults(defineProps<Props>(), { notes: () => [], portrait: false });
const profile = computed(() => PROFILES[props.profile]);
</script>

<template>
  <SlideFrame :foot-right="profile.label">
    <div class="screen">
      <div class="screen__shot" :class="{ 'is-portrait': portrait }">
        <img :src="image" :alt="title" class="screen__img" />
        <div class="screen__cap" :class="{ 'is-portrait': portrait }">
          <span class="screen__chip">
            <svg viewBox="0 0 24 24" class="screen__chip-ic" v-html="profile.icon" />
            {{ profile.label }}
          </span>
          <h2 class="screen__title">{{ title }}</h2>
          <p class="screen__desc">{{ desc }}</p>
          <div v-for="(n, i) in notes" :key="i" class="screen__note">
            <span class="screen__dot" />{{ n }}
          </div>
        </div>
      </div>
    </div>
  </SlideFrame>
</template>

<style scoped>
.screen { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; }
.screen__shot {
  position: relative;
  display: inline-flex;
  animation: shotIn .6s cubic-bezier(.2,0,0,1) both;
}
.screen__img {
  display: block;
  max-width: 1560px;
  max-height: 768px;
  width: auto; height: auto;
  border-radius: 14px;
  border: 1px solid var(--rg-primitive-neutral-200);
  box-shadow: 0 30px 70px rgba(15,23,42,.18), 0 10px 24px rgba(15,23,42,.08);
}
.screen__shot.is-portrait .screen__img { max-height: 800px; }

.screen__cap {
  position: absolute;
  width: 440px;
  background: rgba(255,255,255,.98);
  border: 1px solid var(--rg-primitive-neutral-200);
  border-radius: 18px;
  padding: 20px 24px 22px;
  box-shadow: 0 20px 46px rgba(15,23,42,.18), 0 6px 14px rgba(15,23,42,.08);
  display: flex; flex-direction: column; gap: 10px;
  left: 26px; bottom: 26px;
  animation: capIn .55s .18s cubic-bezier(.2,0,0,1) both;
}
.screen__cap.is-portrait {
  left: auto; bottom: auto;
  right: calc(100% - 70px);
  top: 50%;
  transform: translateY(-50%);
  animation: capInLeft .55s .18s cubic-bezier(.2,0,0,1) both;
}
.screen__chip {
  display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
  padding: 7px 14px 7px 12px; border-radius: 999px;
  background: var(--rg-primitive-brand-50); border: 1px solid var(--rg-primitive-brand-200);
  font-size: 12px; font-weight: 700; letter-spacing: .06em; color: var(--rg-primitive-brand-700);
}
.screen__chip-ic { width: 16px; height: 16px; stroke: var(--rg-primitive-brand-700); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.screen__title { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -.01em; color: var(--rg-primitive-neutral-900); }
.screen__desc { margin: 0; font-size: 15.5px; line-height: 1.48; color: var(--rg-primitive-neutral-600); }
.screen__note { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--rg-primitive-neutral-500); }
.screen__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rg-primitive-brand-400); flex: none; }

@keyframes shotIn { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes capIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes capInLeft { from { opacity: 0; transform: translate(-24px, -50%); } to { opacity: 1; transform: translate(0, -50%); } }
</style>
