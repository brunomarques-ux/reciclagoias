<script setup lang="ts">
import { computed } from 'vue';
import { PROFILES, type ProfileKey } from './data';
// Aceita um perfil (deriva chip/ícone) OU um chip/ícone custom (telas sem perfil).
const props = defineProps<{ profile?: ProfileKey; chip?: string; icon?: string; title: string; desc: string; notes?: string[] }>();
const label = computed(() => props.chip ?? (props.profile ? PROFILES[props.profile].label : ''));
const ic = computed(() => props.icon ?? (props.profile ? PROFILES[props.profile].icon : ''));
</script>

<template>
  <div class="cap">
    <span class="cap__chip">
      <svg viewBox="0 0 24 24" class="cap__chip-ic" v-html="ic" />
      {{ label }}
    </span>
    <h2 class="cap__title">{{ title }}</h2>
    <p class="cap__desc">{{ desc }}</p>
    <div v-for="(n, i) in notes" :key="i" class="cap__note"><span class="cap__dot" />{{ n }}</div>
  </div>
</template>

<style scoped>
.cap {
  width: max-content;
  max-width: 440px;
  background: rgba(255,255,255,.98);
  border: 1px solid var(--rg-primitive-neutral-200);
  border-radius: 18px;
  padding: 20px 24px 22px;
  box-shadow: 0 20px 46px rgba(15,23,42,.18), 0 6px 14px rgba(15,23,42,.08);
  display: flex; flex-direction: column; gap: 10px;
}
.cap__chip {
  display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
  padding: 7px 14px 7px 12px; border-radius: 999px;
  background: var(--rg-primitive-brand-50); border: 1px solid var(--rg-primitive-brand-200);
  font-size: 12px; font-weight: 700; letter-spacing: .06em; color: var(--rg-primitive-brand-700);
}
.cap__chip-ic { width: 16px; height: 16px; stroke: var(--rg-primitive-brand-700); fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.cap__title { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -.01em; color: var(--rg-primitive-neutral-900); }
.cap__desc { margin: 0; font-size: 15.5px; line-height: 1.48; color: var(--rg-primitive-neutral-600); }
.cap__note { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--rg-primitive-neutral-500); }
.cap__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--rg-primitive-brand-400); flex: none; }
</style>
