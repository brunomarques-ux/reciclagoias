<script setup lang="ts">
import SlideFrame from '../SlideFrame.vue';
import ScreenCaption from '../ScreenCaption.vue';
import { PROFILES, type ProfileKey } from '../data';
import { computed } from 'vue';

interface Props {
  profile: ProfileKey;
  image: string;
  title: string;
  desc: string;
  notes?: string[];
  portrait?: boolean;
}
const props = withDefaults(defineProps<Props>(), { notes: () => [], portrait: false });
const label = computed(() => PROFILES[props.profile].label);
</script>

<template>
  <SlideFrame :foot-right="label">
    <div class="screen">
      <div class="screen__shot" :class="{ 'is-portrait': portrait }">
        <img :src="image" :alt="title" class="screen__img" />
        <ScreenCaption
          v-if="!portrait"
          class="screen__cap screen__cap--overlap"
          :profile="profile" :title="title" :desc="desc" :notes="notes"
        />
      </div>
      <ScreenCaption
        v-if="portrait"
        class="screen__cap screen__cap--corner"
        :profile="profile" :title="title" :desc="desc" :notes="notes"
      />
    </div>
  </SlideFrame>
</template>

<style scoped>
.screen { position: relative; flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; }
.screen__shot { position: relative; display: inline-flex; animation: shotIn .6s cubic-bezier(.2,0,0,1) both; }
.screen__img {
  display: block; width: auto; height: auto;
  max-width: 1560px; max-height: 768px;
  border-radius: 14px; border: 1px solid var(--rg-primitive-neutral-200);
  box-shadow: 0 30px 70px rgba(15,23,42,.18), 0 10px 24px rgba(15,23,42,.08);
}
.screen__shot.is-portrait .screen__img { max-height: 824px; }

/* horizontais: legenda sobreposta no canto inferior-esquerdo da própria tela */
.screen__cap--overlap { position: absolute; left: 26px; bottom: 26px; animation: capIn .55s .18s cubic-bezier(.2,0,0,1) both; }
/* verticais: legenda na margem inferior-esquerda do slide (não tampa a tela) */
.screen__cap--corner { position: absolute; left: 0; bottom: 0; animation: capCorner .55s .18s cubic-bezier(.2,0,0,1) both; }

@keyframes shotIn { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes capIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes capCorner { from { opacity: 0; transform: translateX(-22px); } to { opacity: 1; transform: none; } }
</style>
