<script setup lang="ts">
import SlideFrame from '../SlideFrame.vue';
import ScreenCaption from '../ScreenCaption.vue';

defineProps<{ front: string; back: string; title: string; desc: string; notes?: string[] }>();

// Chip formulário (Lucide file-text)
const FILE = '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M9 13h6"/><path d="M9 17h6"/>';
</script>

<template>
  <SlideFrame foot-right="FORMULÁRIO PÚBLICO">
    <div class="mtg">
      <ScreenCaption
        class="mtg__cap"
        chip="FORMULÁRIO PÚBLICO"
        :icon="FILE"
        :title="title"
        :desc="desc"
        :notes="notes"
      />
      <div class="mtg__stack">
        <img :src="back" class="mtg__card mtg__card--back" alt="Resumo da autodeclaração" decoding="sync" />
        <img :src="front" class="mtg__card mtg__card--front" alt="Formulário de autodeclaração" decoding="sync" />
      </div>
    </div>
  </SlideFrame>
</template>

<style scoped>
.mtg { flex: 1; display: flex; align-items: center; justify-content: center; gap: 56px; width: 100%; }
.mtg__cap { flex: none; }

.mtg__stack { position: relative; flex: 1; min-width: 0; height: 100%; }
.mtg__card {
  position: absolute; display: block;
  border-radius: 12px; border: 1px solid var(--rg-primitive-neutral-200);
  box-shadow: 0 28px 60px rgba(15,23,42,.20), 0 8px 20px rgba(15,23,42,.10);
}
/* (13) Confirmação final — alta, atrás à direita */
.mtg__card--back { width: 372px; right: 36px; top: 26px; z-index: 1; animation: mtgBack .6s .1s cubic-bezier(.2,0,0,1) both; }
/* (7) Responsável — larga, na frente à esquerda */
.mtg__card--front { width: 720px; left: 8px; bottom: 96px; z-index: 2; animation: mtgFront .6s .26s cubic-bezier(.34,1.56,.64,1) both; }

@keyframes mtgBack { from { opacity: 0; transform: translate(28px, -10px); } to { opacity: 1; transform: none; } }
@keyframes mtgFront { from { opacity: 0; transform: translateY(26px) scale(.96); } to { opacity: 1; transform: none; } }
</style>
