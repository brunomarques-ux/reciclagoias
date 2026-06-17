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
    <div class="screen" :class="{ 'screen--portrait': portrait }">
      <div class="screen__shot">
        <img :src="image" :alt="title" class="screen__img" decoding="sync" />
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
  max-width: 1640px; max-height: 820px;
  border-radius: 14px; border: 1px solid var(--rg-primitive-neutral-200);
  box-shadow: 0 30px 70px rgba(15,23,42,.18), 0 10px 24px rgba(15,23,42,.08);
}

/* verticais: imagem grande encostada embaixo (gap p/ o rodapé) + legenda na
   margem esquerda do slide, alinhada à base da imagem — espelha o Figma. */
.screen--portrait { align-items: flex-end; padding-bottom: 58px; }
.screen--portrait .screen__img { max-width: 1640px; max-height: none; height: 820px; }

/* horizontais: legenda sobreposta no canto inferior-esquerdo da própria tela */
.screen__cap--overlap { position: absolute; left: 26px; bottom: 39px; animation: capIn .55s .18s cubic-bezier(.2,0,0,1) both; }
/* verticais: legenda na margem esquerda, base alinhada com a base da imagem */
.screen__cap--corner { position: absolute; left: 0; bottom: 58px; animation: capCorner .55s .18s cubic-bezier(.2,0,0,1) both; }

@keyframes shotIn { from { opacity: 0; transform: translateY(14px) scale(.985); } to { opacity: 1; transform: none; } }
@keyframes capIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes capCorner { from { opacity: 0; transform: translateX(-22px); } to { opacity: 1; transform: none; } }
</style>
